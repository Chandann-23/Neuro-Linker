"""
Async background worker for PDF processing and embedding generation
"""

import os
import uuid
import asyncio
import fitz  # PyMuPDF
from typing import List, Dict, Any
from fastapi import UploadFile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFProcessor:
    """Async PDF processing with chunking and metadata extraction"""
    
    @staticmethod
    async def extract_text_async(file_path: str) -> str:
        """Extract text from PDF asynchronously"""
        def _extract():
            text = ""
            try:
                with fitz.open(file_path) as doc:
                    for page in doc:
                        text += page.get_text() + " "
            except Exception as e:
                logger.error(f"Error reading {file_path}: {e}")
            return text.strip()
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _extract)
    
    @staticmethod
    def split_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks"""
        if not text:
            return []
        
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += (chunk_size - chunk_overlap)
            
            if chunk_size <= chunk_overlap:
                break
                
        return chunks
    
    @staticmethod
    def extract_metadata(text: str, filename: str) -> Dict[str, Any]:
        """Extract basic metadata from resume text"""
        # Simple keyword-based extraction
        text_lower = text.lower()
        
        # Common skills to look for
        skills_keywords = [
            'python', 'java', 'javascript', 'react', 'node.js', 'aws', 'docker',
            'kubernetes', 'machine learning', 'ai', 'deep learning', 'tensorflow',
            'pytorch', 'sql', 'mongodb', 'postgresql', 'git', 'ci/cd'
        ]
        
        found_skills = [skill for skill in skills_keywords if skill in text_lower]
        
        # Extract years of experience (simple regex)
        import re
        experience_pattern = r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience'
        experience_matches = re.findall(experience_pattern, text_lower)
        experience_years = int(experience_matches[0]) if experience_matches else None
        
        return {
            'filename': filename,
            'skills': found_skills,
            'experience_years': experience_years,
            'text_length': len(text)
        }

async def process_pdf_task(
    task_id: str, 
    files: List[UploadFile], 
    task_store: Dict[str, Any],
    matcher: Any
):
    """Background task to process uploaded PDFs"""
    try:
        # Create data directory if it doesn't exist
        os.makedirs("data", exist_ok=True)
        
        processed_files = []
        failed_files = []
        
        for i, file in enumerate(files):
            try:
                # Update progress
                task_store[task_id].processed_files = i
                task_store[task_id].message = f"Processing {file.filename}..."
                
                # Save uploaded file
                file_path = f"data/{task_id}_{file.filename}"
                with open(file_path, "wb") as f:
                    content = await file.read()
                    f.write(content)
                
                # Extract text
                text = await PDFProcessor.extract_text_async(file_path)
                if not text:
                    failed_files.append(file.filename)
                    continue
                
                # Split into chunks
                chunks = PDFProcessor.split_text(text)
                
                # Extract metadata
                metadata = PDFProcessor.extract_metadata(text, file.filename)
                
                # Add to vector store
                await matcher.add_document_async(
                    text=text,
                    chunks=chunks,
                    metadata=metadata
                )
                
                processed_files.append(file.filename)
                
                # Clean up temporary file
                os.remove(file_path)
                
            except Exception as e:
                logger.error(f"Failed to process {file.filename}: {e}")
                failed_files.append(file.filename)
        
        # Update final status
        if processed_files:
            task_store[task_id].status = "completed"
            task_store[task_id].message = f"Successfully processed {len(processed_files)} files"
            if failed_files:
                task_store[task_id].message += f". Failed: {', '.join(failed_files)}"
        else:
            task_store[task_id].status = "failed"
            task_store[task_id].message = "No files were processed successfully"
        
        task_store[task_id].processed_files = len(files)
        
    except Exception as e:
        logger.error(f"Task {task_id} failed: {e}")
        task_store[task_id].status = "failed"
        task_store[task_id].message = f"Processing failed: {str(e)}"
