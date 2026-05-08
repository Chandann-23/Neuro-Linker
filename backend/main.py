"""
NEURO-LINKER Backend - FastAPI Production Server
Handles async PDF processing, vector search, and candidate matching
"""

import os
import uuid
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from engine import VectorMatcher, LLMAnalyzer
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
@app.post("/upload", response_model=UploadResponse)
async def upload_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    """Upload PDF files for processing"""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    task_id = str(uuid.uuid4())
    
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

# Status endpoint
@app.get("/status/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Get processing status for uploaded files"""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_store[task_id]

# Search endpoint
@app.post("/search", response_model=List[SearchResult])
async def search_candidates(request: SearchRequest):
    """Search for candidates using hybrid semantic search"""
    if not matcher:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    try:
        start_time = time.perf_counter()
        
        results = await matcher.search_async(
            query=request.query,
            top_k=request.top_k,
            alpha=request.alpha,
            filters=request.filters
        )
        
        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000
        
        # Trace search with LangSmith
        await observability.trace_search(
            query=request.query,
            results=results,
            semantic_weight=request.alpha,
            keyword_weight=1 - request.alpha,
            latency_ms=latency_ms,
            filters=request.filters
        )
        
        # Log metrics to database
        await db_logger.log_search_metrics({
            "query": request.query,
            "results_count": len(results),
            "top_confidence": results[0]["score"] if results else 0.0,
            "latency_ms": latency_ms,
            "filters": request.filters
        })
        
        return [
            SearchResult(
                filename=result["filename"],
                score=result["score"],
                semantic_score=result["semantic_score"],
                keyword_score=result["keyword_score"],
                matched_chunk=result["matched_chunk"],
                content_preview=result["content"][:500] + "..." if len(result["content"]) > 500 else result["content"]
            )
            for result in results
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Analysis endpoint
@app.post("/analyze")
async def analyze_candidate_fit(filename: str, job_description: str):
    """Analyze candidate fit using LLM"""
    if not matcher:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    try:
        # Get candidate content
        candidate_content = await matcher.get_document_content(filename)
        if not candidate_content:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Perform analysis
        analysis = LLMAnalyzer.analyze_fit(candidate_content, job_description)
        
        return {"analysis": analysis, "filename": filename}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

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
