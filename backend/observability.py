"""
LangSmith integration for observability and MLOps tracking
"""

import os
import time
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from langsmith import Client, traceable
from langsmith import RunTree
import logging

class ObservabilityManager:
    """Manages LangSmith tracing and logging for NEURO-LINKER"""
    
    def __init__(self):
        self.langsmith_client = None
        self.enabled = False
        self.logger = logging.getLogger(__name__)
        
        # Initialize LangSmith if environment variables are set
        if os.getenv("LANGSMITH_API_KEY") and os.getenv("LANGSMITH_PROJECT"):
            try:
                self.langsmith_client = Client(
                    api_key=os.getenv("LANGSMITH_API_KEY"),
                    api_url=os.getenv("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com")
                )
                self.enabled = True
                self.logger.info("LangSmith observability enabled")
            except Exception as e:
                self.logger.error(f"Failed to initialize LangSmith: {e}")
    
    @traceable(name="hybrid_search")
    async def trace_search(
        self,
        query: str,
        results: list,
        semantic_weight: float,
        keyword_weight: float,
        latency_ms: float,
        filters: Optional[Dict[str, Any]] = None
    ):
        """Trace search operation with LangSmith"""
        if not self.enabled:
            return
        
        try:
            # Extract key metrics
            top_result = results[0] if results else None
            confidence_score = top_result.get('score', 0.0) if top_result else 0.0
            
            # Determine match type
            match_type = "semantic" if top_result and top_result.get('semantic_score', 0) > top_result.get('keyword_score', 0) else "keyword"
            
            # Log to LangSmith
            run_data = {
                "query": query,
                "results_count": len(results),
                "top_confidence": confidence_score,
                "match_type": match_type,
                "semantic_weight": semantic_weight,
                "keyword_weight": keyword_weight,
                "latency_ms": latency_ms,
                "filters": filters or {},
                "timestamp": datetime.utcnow().isoformat(),
                "top_filename": top_result.get('filename') if top_result else None
            }
            
            # Store in LangSmith
            self.langsmith_client.create_run(
                name="hybrid_search",
                inputs={"query": query, "filters": filters or {}},
                outputs={
                    "results": results[:3],  # Store top 3 results
                    "metrics": run_data
                },
                run_type="chain",
                end_time=time.time()
            )
            
            self.logger.info(f"Search traced: {query[:50]}... (confidence: {confidence_score:.3f})")
            
        except Exception as e:
            self.logger.error(f"Failed to trace search: {e}")
    
    @traceable(name="document_processing")
    async def trace_document_processing(
        self,
        filename: str,
        chunk_count: int,
        processing_time_ms: float,
        skills_extracted: list,
        experience_years: Optional[int] = None
    ):
        """Trace document processing with LangSmith"""
        if not self.enabled:
            return
        
        try:
            run_data = {
                "filename": filename,
                "chunk_count": chunk_count,
                "processing_time_ms": processing_time_ms,
                "skills_extracted": skills_extracted,
                "experience_years": experience_years,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.langsmith_client.create_run(
                name="document_processing",
                inputs={"filename": filename},
                outputs=run_data,
                run_type="chain",
                end_time=time.time()
            )
            
            self.logger.info(f"Document processing traced: {filename} ({chunk_count} chunks)")
            
        except Exception as e:
            self.logger.error(f"Failed to trace document processing: {e}")
    
    def log_feedback(self, task_id: str, filename: str, feedback: bool, score: float):
        """Log user feedback for model improvement"""
        if not self.enabled:
            return
        
        try:
            feedback_data = {
                "task_id": task_id,
                "filename": filename,
                "feedback": feedback,  # thumbs up/down
                "score": score,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Store feedback in LangSmith for future analysis
            self.langsmith_client.create_run(
                name="user_feedback",
                inputs=feedback_data,
                outputs=feedback_data,
                run_type="chain"
            )
            
            self.logger.info(f"Feedback logged: {filename} -> {feedback}")
            
        except Exception as e:
            self.logger.error(f"Failed to log feedback: {e}")

class DatabaseLogger:
    """Handles logging to PostgreSQL for analytics and feedback"""
    
    def __init__(self):
        self.connection_string = os.getenv(
            "DATABASE_URL", 
            "postgresql://user:password@localhost/neuro_linker"
        )
        self.logger = logging.getLogger(__name__)
    
    async def log_search_metrics(self, search_data: Dict[str, Any]):
        """Log search metrics to PostgreSQL"""
        try:
            # This would use asyncpg or similar for actual DB connection
            # For now, we'll simulate the logging
            self.logger.info(f"Search metrics logged: {search_data}")
            
        except Exception as e:
            self.logger.error(f"Failed to log search metrics: {e}")
    
    async def log_user_feedback(self, feedback_data: Dict[str, Any]):
        """Log user feedback to PostgreSQL"""
        try:
            # This would use asyncpg or similar for actual DB connection
            # For now, we'll simulate the logging
            self.logger.info(f"User feedback logged: {feedback_data}")
            
        except Exception as e:
            self.logger.error(f"Failed to log user feedback: {e}")

# Global observability manager
observability = ObservabilityManager()
db_logger = DatabaseLogger()
