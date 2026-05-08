"""
Pydantic models for NEURO-LINKER API
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class TaskStatus(BaseModel):
    task_id: str
    status: str  # "processing", "completed", "failed"
    total_files: int
    processed_files: int
    message: str
    created_at: datetime = None
    updated_at: datetime = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class SearchResult(BaseModel):
    filename: str
    score: float
    semantic_score: float
    keyword_score: float
    matched_chunk: str
    content_preview: str

class UploadResponse(BaseModel):
    task_id: str
    message: str

class DocumentMetadata(BaseModel):
    filename: str
    file_size: int
    upload_date: datetime
    processed: bool
    chunk_count: int
    skills: List[str] = []
    experience_years: Optional[int] = None

class SearchMetrics(BaseModel):
    query: str
    total_results: int
    average_score: float
    semantic_weight: float
    keyword_weight: float
    latency_ms: float
    timestamp: datetime
