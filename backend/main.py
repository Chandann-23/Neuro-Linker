"""
NEURO-LINKER Backend - FastAPI Production Server
Handles async PDF processing, vector search, and candidate matching
"""

import os
import uuid
import asyncio
import logging
import traceback
import subprocess
import sys
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Add current directory to path just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from engine import VectorMatcher
from worker import process_pdf_task
from models import TaskStatus, SearchResult, UploadResponse
from observability import observability, db_logger

# Global variables
matcher: Optional[VectorMatcher] = None
task_store: Dict[str, TaskStatus] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the vector matcher on startup"""
    global matcher
    matcher = VectorMatcher()
    
    # Initialize Qdrant connection and load existing data
    await matcher.initialize_qdrant()
    
    yield
    
    # Cleanup
    if matcher:
        await matcher.close()

app = FastAPI(
    title="NEURO-LINKER API",
    description="Production-grade semantic resume matching system",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,  # Cache preflight responses for 10 minutes
)

# Pydantic models
class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    alpha: float = 0.7
    filters: Optional[Dict[str, Any]] = None

class FeedbackRequest(BaseModel):
    task_id: str
    filename: str
    feedback: bool  # thumbs up/down
    score: float

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "vector_store": "connected" if matcher else "disconnected"}

# Upload endpoint
# Complete resume upload and processing route
@app.post("/upload-resume", response_model=dict)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload and process PDF resume to vector database"""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        # USE THE GLOBAL MATCHER INSTEAD OF REDEFINING EVERYTHING
        if not matcher:
            raise HTTPException(status_code=503, detail="Vector store not initialized")

        # 1. Read file content
        import pypdf2
        reader = pypdf2.PdfReader(file.file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text extracted")

        # 2. Use the EXISTING VectorMatcher (BGE-M3) to ensure 1024-dim
        # This replaces the old MiniLM code that was causing the 0% match
        task_id = str(uuid.uuid4())
        
        # We wrap this in a list because the process_pdf_task expects a list of files
        background_tasks.add_task(process_pdf_task, task_id, [file], task_store, matcher)
        
        return {
            "status": "success",
            "message": f"Resume '{file.filename}' is being indexed with BGE-M3 (1024-dim)",
            "task_id": task_id
        }
        
    except Exception as e:
        logging.error(f"Resume processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    # Store initial task status
    task_store[task_id] = TaskStatus(
        task_id=task_id,
        status="processing",
        total_files=len(files),
        processed_files=0,
        message="Starting PDF processing..."
    )
    
    # Add background task for processing
    background_tasks.add_task(process_pdf_task, task_id, files, task_store, matcher)
    
    return UploadResponse(
        task_id=task_id,
        message=f"Processing {len(files)} files. Use /status/{task_id} to track progress."
    )

# Single file upload endpoint
@app.post("/upload-single", response_model=UploadResponse)
async def upload_single_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload single PDF file for processing"""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    task_id = str(uuid.uuid4())
    
    # Store initial task status
    task_store[task_id] = TaskStatus(
        task_id=task_id,
        status="processing",
        total_files=1,
        processed_files=0,
        message=f"Processing {file.filename}..."
    )
    
    # Add background task for processing
    background_tasks.add_task(process_pdf_task, task_id, [file], task_store, matcher)
    
    return UploadResponse(
        task_id=task_id,
        message=f"Processing {file.filename}. Use /status/{task_id} to track progress."
    )

# Complete resume upload and processing route
@app.post("/upload-resume", response_model=dict)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload and process PDF resume to vector database"""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        # Extract text from PDF
        import pypdf2
        reader = pypdf2.PdfReader(file.file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from PDF")
        
        # Generate embeddings
        from sentence_transformers import SentenceTransformer
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = embedding_model.encode([text])
        
        # Store in Qdrant
        qdrant_client = QdrantClient(
            url=os.getenv('QDRANT_URL', 'http://localhost:6333'),
            api_key=os.getenv('QDRANT_API_KEY', ''),
            prefer_grpc=False
        )
        
        # Create collection if not exists
        try:
            qdrant_client.get_collection(collection_name="resume_chunks")
        except Exception:
            qdrant_client.create_collection(
                collection_name="resume_chunks",
                vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
                hnsw_config={"m": 16, "ef_construction": 256}
            )
        
        # Prepare points for upsert
        points = [
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding.tolist()[0],
                payload={
                    "filename": file.filename,
                    "name": file.filename.replace('.pdf', ''),
                    "text": text[:1000] + "..." if len(text) > 1000 else text
                }
            )
        ]
        
        # Upsert to Qdrant
        qdrant_client.upsert(
            collection_name="resume_chunks",
            points=points
        )
        
        return {
            "status": "success",
            "message": f"Resume '{file.filename}' processed and indexed successfully",
            "filename": file.filename,
            "chunks_count": len(text.split('. ')) if text else 1
        }
        
    except Exception as e:
        logging.error(f"Resume processing failed: {str(e)}")
        logging.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

# Status endpoint
@app.get("/status/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Get processing status for uploaded files"""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_store[task_id]

# Agentic Search endpoint with GLM 5.1
@app.post("/search", response_model=List[SearchResult])
async def search_candidates(request: SearchRequest):
    """Agentic search using GLM 5.1 with 200K context window"""
    if not matcher:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    try:
        start_time = time.perf_counter()
        
        # Validate Qdrant collection exists before searching
        if not matcher or not matcher.qdrant_client:
            return [
                SearchResult(
                    filename="Vector store not initialized",
                    score=0.0,
                    semantic_score=0.0,
                    keyword_score=0.0,
                    matched_chunk="",
                    content_preview="Please upload some resumes first to initialize the vector database."
                )
            ]
        
        # First get top 10 candidates from vector store
        try:
            vector_results = await matcher.search_async(
                query=request.query,
                top_k=10,
                alpha=request.alpha,
                filters=request.filters
            )
        except ValueError as ve:
            # Handle empty store gracefully instead of crashing
            if "Vector store not initialized" in str(ve):
                return [
                    SearchResult(
                        filename="No candidates found",
                        score=0.0,
                        semantic_score=0.0,
                        keyword_score=0.0,
                        matched_chunk="",
                        content_preview="No matching candidates found for your query. Please upload some resumes first using Data Ingestion tab."
                    )
                ]
            else:
                raise ve
        
        # Handle empty results gracefully
        if not vector_results:
            return [
                SearchResult(
                    filename="No candidates found",
                    score=0.0,
                    semantic_score=0.0,
                    keyword_score=0.0,
                    matched_chunk="",
                    content_preview="No matching candidates found for your query. Please upload some resumes first using the Data Ingestion tab."
                )
            ]
        
        # Return raw Qdrant data
        return [
            SearchResult(
                filename=result["filename"],
                score=result["score"],
                semantic_score=result["semantic_score"],
                keyword_score=result["keyword_score"],
                matched_chunk=result["matched_chunk"],
                content_preview=result["content"][:300] + "..."
            )
            for result in vector_results[:5]
        ]
        
    except Exception as e:
        logging.error(f"Agentic search failed: {str(e)}")
        logging.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Agentic search failed: {str(e)}")

# Feedback endpoint
@app.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """Submit user feedback for model improvement"""
    # Log feedback to LangSmith and database
    observability.log_feedback(
        task_id=feedback.task_id,
        filename=feedback.filename,
        feedback=feedback.feedback,
        score=feedback.score
    )
    
    await db_logger.log_user_feedback({
        "task_id": feedback.task_id,
        "filename": feedback.filename,
        "feedback": feedback.feedback,
        "score": feedback.score,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return {"message": "Feedback recorded", "task_id": feedback.task_id}

# Metrics endpoint
@app.get("/metrics")
async def get_system_metrics():
    """Get system performance metrics"""
    if not matcher:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    return {
        "total_documents": await matcher.get_document_count(),
        "total_chunks": await matcher.get_chunk_count(),
        "active_tasks": len([t for t in task_store.values() if t.status == "processing"]),
        "average_latency": await matcher.get_average_latency()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=7860,
        reload=True,
        log_level="info"
    )
