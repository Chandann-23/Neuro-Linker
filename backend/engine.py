"""
Engine module for Vector-based Semantic Matcher.
Handles PDF text extraction, embedding generation, and Qdrant vector indexing.
"""

import os
import uuid
import asyncio
import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import time
import logging


class TextSplitter:
    """Class to handle recursive character text splitting."""

    @staticmethod
    def split_text(text, chunk_size=500, chunk_overlap=50):
        """
        Splits text into chunks of chunk_size with chunk_overlap.

        Args:
            text (str): The text to split.
            chunk_size (int): Max size of each chunk.
            chunk_overlap (int): Overlap between chunks.

        Returns:
            list: List of text chunks.
        """
        if not text:
            return []
        
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            # Move start forward by chunk_size - overlap
            start += (chunk_size - chunk_overlap)
            
            # Prevent infinite loop if overlap >= size
            if chunk_size <= chunk_overlap:
                break
                
        return chunks


class PDFProcessor:
    """Class to handle PDF text extraction using PyMuPDF."""

    @staticmethod
    def extract_text(file_path):
        """
        Extract text from a PDF file using PyMuPDF.

        Args:
            file_path (str): Path to the PDF file.

        Returns:
            str: Extracted text from the PDF.
        """
        text = ""
        try:
            # Using PyMuPDF for better text extraction and encoding handling
            with fitz.open(file_path) as doc:
                for page in doc:
                    # get_text() automatically handles most common encoding issues
                    text += page.get_text() + " "
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
        
        # Clean up text and ensure it's not empty
        return text.strip()

    @staticmethod
    def process_data_folder(data_folder):
        """
        Utility function to scan a folder, extract text from all PDFs, 
        and prepare them for indexing.

        Args:
            data_folder (str): Path to the folder containing PDF resumes.

        Returns:
            tuple: A tuple of (texts_list, filenames_list).
        """
        texts = []
        filenames = []

        if not os.path.exists(data_folder):
            print(f"Error: Data folder '{data_folder}' does not exist.")
            return [], []

        for filename in os.listdir(data_folder):
            if filename.lower().endswith(".pdf"):
                file_path = os.path.join(data_folder, filename)
                text = PDFProcessor.extract_text(file_path)
                if text:
                    texts.append(text)
                    filenames.append(filename)
                else:
                    print(f"Warning: No text extracted from {filename}")

        return texts, filenames


class LLMAnalyzer:
    """Class to perform AI-driven analysis on candidate-job fit."""

    @staticmethod
    def analyze_fit(resume_text, job_description):
        """
        Mock LLM call to analyze fit.
        In a real scenario, this would call OpenAI, Groq, or a local Ollama instance.
        """
        # --- Real-world Ollama / API structure (Commented out for now) ---
        # response = requests.post('http://localhost:11434/api/generate', 
        #                         json={'model': 'llama2', 'prompt': prompt})
        
        # Simple heuristic analysis for the demo
        jd_keywords = set(job_description.lower().split())
        resume_keywords = set(resume_text.lower().split())
        overlap = jd_keywords.intersection(resume_keywords)
        common_skills = [s.capitalize() for s in overlap if len(s) > 5][:3]
        
        if not common_skills:
            common_skills = ["Strong Technical Skills", "Relevant Experience", "Problem Solving"]

        # Generating 3 points and 2 questions
        analysis = {
            "match_points": [
                f"Candidate demonstrates expertise in **{common_skills[0]}**, matching core requirements.",
                f"Previous background aligns with the technical scope of the **{job_description[:30]}...** role.",
                f"Strong evidence of specialized skills in **{common_skills[1 if len(common_skills)>1 else 0]}** found in resume."
            ],
            "interview_questions": [
                f"Can you walk us through a specific project where you applied your skills in **{common_skills[0]}**?",
                f"Given your background in **{common_skills[-1]}**, how would you approach the challenges mentioned in the job description?"
            ]
        }
        return analysis


class VectorMatcher:
    """Class to handle embeddings and semantic search using Qdrant with chunking."""

    def __init__(self, model_name="all-MiniLM-L6-v2"):
        """
        Initialize the VectorMatcher with a sentence-transformer model and Qdrant client.

        Args:
            model_name (str): The name of the sentence-transformer model to use.
        """
        self.model = SentenceTransformer(model_name)
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        self.qdrant_client: Optional[QdrantClient] = None
        self.collection_name = "resume_chunks"
        self.tfidf_matrix = None
        self.documents = {}  # filename -> full document
        self.chunks = []     # All text chunks
        self.chunk_metadata = [] # Metadata for each chunk
        self.latency_history = []
        
        # Qdrant configuration - use environment variables in production
        self.qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    async def initialize_qdrant(self):
        """Initialize Qdrant client and create collection if it doesn't exist."""
        try:
            self.qdrant_client = QdrantClient(
                url=self.qdrant_url,
                api_key=self.qdrant_api_key
            )
            
            # Check if collection exists, create if not
            collections = self.qdrant_client.get_collections().collections
            collection_exists = any(c.name == self.collection_name for c in collections)
            
            if not collection_exists:
                self.qdrant_client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=384,  # MiniLM-L6-v2 dimension
                        distance=Distance.COSINE
                    ),
                    hnsw_config={
                        "m": 16,
                        "ef_construct": 64,
                        "full_scan_threshold": 10000
                    }
                )
                self.logger.info(f"Created collection {self.collection_name}")
            
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize Qdrant: {e}")
            return False

    async def add_document_async(self, text: str, chunks: List[str], metadata: Dict[str, Any]):
        """Add a single document to Qdrant with async processing."""
        if not self.qdrant_client:
            raise Exception("Qdrant client not initialized")
        
        # Store full document
        filename = metadata.get('filename', 'unknown')
        self.documents[filename] = text
        
        # Generate embeddings for chunks
        embeddings = self.model.encode(chunks)
        
        # Prepare points for Qdrant
        points = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = str(uuid.uuid4())
            points.append(PointStruct(
                id=point_id,
                vector=embedding.tolist(),
                payload={
                    "filename": filename,
                    "chunk_text": chunk,
                    "chunk_index": i,
                    **metadata
                }
            ))
        
        # Upload to Qdrant in batches
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=batch
            )
        
        # Update TF-IDF matrix
        self.chunks.extend(chunks)
        self.chunk_metadata.extend([metadata] * len(chunks))
        await self._update_tfidf_matrix()
        
        return True

    async def _update_tfidf_matrix(self):
        """Update TF-IDF matrix with all chunks."""
        if self.chunks:
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.chunks)

    async def close(self):
        """Close Qdrant connection."""
        if self.qdrant_client:
            self.qdrant_client.close()

    def build_index(self, data_folder):
        """
        Scan the data folder and build the FAISS index with chunking.

        Args:
            data_folder (str): Path to the folder containing PDF resumes.

        Returns:
            bool: True if index built successfully, False otherwise.
        """
        texts, filenames = PDFProcessor.process_data_folder(data_folder)
        return self.add_documents(texts, filenames)

    async def search_async(self, query: str, top_k: int = 3, alpha: float = 0.7, filters: Optional[Dict[str, Any]] = None):
        """
        Async Hybrid Search with Chunk Aggregation using Qdrant.
        Matches chunks and returns the best matching parent documents.

        Args:
            query (str): The search query.
            top_k (int): Number of top matches to return.
            alpha (float): Weight for Semantic score.
            filters (Optional[Dict[str, Any]]): Metadata filters.

        Returns:
            list: A list of dicts with match details.
        """
        start_time = time.perf_counter()
        
        if not query:
            raise ValueError("Empty search query provided.")

        if not self.qdrant_client or self.tfidf_matrix is None:
            raise ValueError("Vector store not initialized. Please add documents first.")

        # 1. Semantic Search Score (Chunk-level) using Qdrant
        query_embedding = self.model.encode([query])[0].tolist()
        
        # Build Qdrant filter if provided
        qdrant_filter = None
        if filters:
            conditions = []
            for key, value in filters.items():
                conditions.append(FieldCondition(key=key, match=MatchValue(value=value)))
            if conditions:
                qdrant_filter = Filter(must=conditions)
        
        # Search Qdrant
        search_result = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            query_filter=qdrant_filter,
            limit=1000,  # Get more results for better aggregation
            with_payload=True,
            with_vectors=False
        )
        
        # Extract semantic scores and chunk info
        semantic_scores = {}
        chunk_info = []
        for hit in search_result:
            filename = hit.payload.get('filename')
            semantic_scores[hit.id] = hit.score
            chunk_info.append(hit.payload)

        # 2. Keyword Search Score (Chunk-level)
        query_tfidf = self.tfidf_vectorizer.transform([query])
        keyword_scores = cosine_similarity(query_tfidf, self.tfidf_matrix).flatten()
        
        # Map keyword scores to chunk IDs
        keyword_scores_dict = {}
        chunk_index = 0
        for i, metadata in enumerate(self.chunk_metadata):
            filename = metadata.get('filename', f'doc_{i}')
            # Safety check for chunk_info - ensure we're working with dictionaries
            matching_chunks = [c for c in chunk_info if isinstance(c, dict) and c.get('filename') == filename]
            chunk_id = f"{filename}_{chunk_index % max(1, len(matching_chunks))}"
            if chunk_index < len(keyword_scores):
                keyword_scores_dict[chunk_id] = keyword_scores[chunk_index]
            chunk_index += 1

        # 3. Hybrid Combination (Chunk-level)
        hybrid_scores = {}
        for chunk_id in semantic_scores:
            sem_score = semantic_scores[chunk_id]
            kw_score = keyword_scores_dict.get(chunk_id, 0.0)
            hybrid_score = (alpha * sem_score) + ((1 - alpha) * kw_score)
            hybrid_scores[chunk_id] = hybrid_score

        # 4. Aggregation by Parent Document
        doc_results = {}  # filename -> best match details
        
        for chunk_id, hybrid_score in hybrid_scores.items():
            payload = chunk_info.get(chunk_id, {})
            filename = payload.get('filename', 'unknown')
            
            if filename not in doc_results or hybrid_score > doc_results[filename]['score']:
                doc_results[filename] = {
                    "filename": filename,
                    "score": float(hybrid_score),
                    "semantic_score": float(semantic_scores.get(chunk_id, 0.0)),
                    "keyword_score": float(keyword_scores_dict.get(chunk_id, 0.0)),
                    "content": self.documents.get(filename, ''),
                    "matched_chunk": payload.get('chunk_text', ''),
                    "metadata": payload
                }

        # 5. Sort and return top K
        sorted_docs = sorted(doc_results.values(), key=lambda x: x['score'], reverse=True)
        
        # Track latency
        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000
        self.latency_history.append(latency_ms)
        
        return sorted_docs[:top_k]

    async def get_dimension_scores(self, text: str, dimensions: List[str]) -> Dict[str, float]:
        """
        Calculate similarity scores between a text and a list of dimensions.
        
        Args:
            text (str): The text to evaluate (e.g., resume content).
            dimensions (list): List of dimension strings.
            
        Returns:
            dict: {dimension: score}
        """
        if not text or not dimensions:
            return {d: 0.0 for d in dimensions}

        # Encode text and dimensions
        text_emb = self.model.encode([text])
        dim_embs = self.model.encode(dimensions)

        # Normalize for cosine similarity
        text_emb = text_emb / np.linalg.norm(text_emb, axis=1, keepdims=True)
        dim_embs = dim_embs / np.linalg.norm(dim_embs, axis=1, keepdims=True)

        # Calculate similarity (Inner Product on normalized vectors = Cosine Similarity)
        scores = np.dot(text_emb, dim_embs.T).flatten()
        
        # Scale scores slightly for better visualization (0-1 range)
        return {dim: float(max(0, s)) for dim, s in zip(dimensions, scores)}
    
    async def get_document_content(self, filename: str) -> Optional[str]:
        """Get full document content by filename."""
        return self.documents.get(filename)
    
    async def get_document_count(self) -> int:
        """Get total number of documents."""
        if not self.qdrant_client:
            return 0
        collection_info = self.qdrant_client.get_collection(self.collection_name)
        return collection_info.points_count
    
    async def get_chunk_count(self) -> int:
        """Get total number of chunks."""
        return len(self.chunks)
    
    async def get_average_latency(self) -> float:
        """Get average search latency in milliseconds."""
        if not self.latency_history:
            return 0.0
        return sum(self.latency_history) / len(self.latency_history)
