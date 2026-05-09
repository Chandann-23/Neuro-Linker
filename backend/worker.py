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
    """Background task to process uploaded PDFs - MEMORY-FIRST VERSION"""
    processed_files = []
    failed_files = []
    
    try:
        for i, file in enumerate(files):
            try:
                # Update progress
                task_store[task_id].processed_files = i
                task_store[task_id].message = f"Processing {file.filename}..."
                
                # 1. READ DIRECTLY FROM MEMORY
                content = await file.read()
                
                # 2. Open PDF from stream
                text = ""
                with fitz.open(stream=content, filetype="pdf") as doc:
                    for page in doc:
                        text += page.get_text() + " "
                
                if not text.strip():
                    logger.error(f"Text extraction empty for {file.filename}")
                    failed_files.append(file.filename)
                    continue
                
                # 3. Split into chunks
                chunks = PDFProcessor.split_text(text)
                
                # 4. Metadata
                metadata = PDFProcessor.extract_metadata(text, file.filename)
                
                # 5. Add to vector store
                await matcher.add_document_async(
                    text=text,
                    chunks=chunks,
                    metadata=metadata
                )
                
                processed_files.append(file.filename)
                logger.info(f"Successfully indexed: {file.filename}")
                
            except Exception as e:
                logger.error(f"Failed to process {file.filename}: {e}")
                failed_files.append(file.filename)
        
        # FINAL STATUS UPDATE (Only once, outside the loop)
        task_store[task_id].status = "completed" if processed_files else "failed"
        task_store[task_id].processed_files = len(files)
        
        if processed_files:
            msg = f"Successfully processed {len(processed_files)} files."
            if failed_files:
                msg += f" Failed: {', '.join(failed_files)}"
            task_store[task_id].message = msg
        else:
            task_store[task_id].message = "No files were processed successfully."

    except Exception as e:
        logger.error(f"Critical Task {task_id} failure: {e}")
        task_store[task_id].status = "failed"
        task_store[task_id].message = f"Worker Error: {str(e)}"