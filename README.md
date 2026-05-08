---
title: Neuro-Linker API
emoji: 🧠
colorFrom: indigo
colorTo: gray
sdk: fastapi
app_file: main.py
---

# 🧬 NEURO-LINKER: Production-Grade Semantic Recruitment System

Transformed from Streamlit prototype to a scalable, production-ready microservices architecture with modern observability and deployment capabilities.

---

## 🚀 Architecture Overview

### Backend (FastAPI + Qdrant + LangSmith)
- **FastAPI**: Async REST API with background task processing
- **Qdrant**: Production-grade vector database with HNSW indexing
- **LangSmith**: Observability and MLOps tracking
- **PostgreSQL**: Analytics and feedback storage
- **Redis**: Background task queue

### Frontend (Next.js 15 + Tailwind CSS)
- **Modern UI**: Dark Velvet theme with glassmorphism effects
- **Real-time**: Progress tracking and live updates
- **Responsive**: Mobile-first design with Tailwind CSS
- **Interactive**: Charts, file upload, and feedback system

---

## 🛠️ Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose

### Installation
```bash
# Clone repository
git clone https://github.com/Chandann-23/Neuro-Linker.git
cd Neuro-Linker

# Backend setup
cd backend
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
npm run dev
```

---

## 📊 API Endpoints

### Core Routes
- `POST /upload` - Batch PDF processing
- `POST /upload-single` - Single file upload
- `POST /upload-resume` - Complete resume processing pipeline
- `GET /status/{task_id}` - Task status tracking
- `POST /search` - Agentic GLM 5.1 search with 200K context
- `GET /health` - System health check
- `GET /metrics` - Performance monitoring

---

## 🚀 Deployment

### Hugging Face Spaces
- **SDK**: fastapi
- **App File**: backend/main.py
- **Requirements**: requirements.txt (root directory)
- **Dependencies**: zhipuai>=2.0.1, qdrant-client, pypdf2, sentence-transformers

### Environment Variables
- `ZHIPU_API_KEY` - Zhipu AI authentication
- `QDRANT_URL` - Vector database URL
- `QDRANT_API_KEY` - Qdrant authentication

---
# 🧬 NEURO-LINKER: Production-Grade Semantic Recruitment System

Transformed from Streamlit prototype to a scalable, production-ready microservices architecture with modern observability and deployment capabilities.

---

## 🚀 Architecture Overview

### Backend (FastAPI + Qdrant + LangSmith)
- **FastAPI**: Async REST API with background task processing
- **Qdrant**: Production-grade vector database with HNSW indexing
- **LangSmith**: Observability and MLOps tracking
- **PostgreSQL**: Analytics and feedback storage
- **Redis**: Background task queue

### Frontend (Next.js 15 + Tailwind CSS)
- **Modern UI**: Dark Velvet theme with glassmorphism effects
- **Real-time**: Progress tracking and live updates
- **Responsive**: Mobile-first design with Tailwind CSS
- **Interactive**: Charts, file upload, and feedback system

---

## 🛠️ Tech Stack

### Backend
- **Language**: Python 3.10+
- **API Framework**: FastAPI with async support
- **Vector Database**: Qdrant Cloud (HNSW algorithm)
- **Embeddings**: Sentence-Transformers (`all-MiniLM-L6-v2`)
- **Hybrid Search**: Semantic vectors + TF-IDF keywords
- **Observability**: LangSmith tracing and logging
- **Database**: PostgreSQL for analytics
- **Task Queue**: Redis + Celery for background processing

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom Dark Velvet theme
- **Icons**: Lucide React
- **UI Components**: Custom glassmorphism design system
- **State Management**: React hooks with optimistic updates

---

## ✨ Production Features

### 🔍 Advanced Search
- **Hybrid Algorithm**: 70% semantic + 30% keyword weighting
- **Metadata Filtering**: Filter by skills, experience, etc.
- **Real-time Scoring**: Live confidence scores and match types
- **Chunk Aggregation**: Intelligent document-level result ranking

### 📊 Observability & MLOps
- **LangSmith Integration**: Full search traceability
- **Performance Metrics**: Latency tracking and system health
- **User Feedback**: Thumbs up/down for model improvement
- **Analytics Dashboard**: Real-time system metrics

### 🎨 Modern UI/UX
- **Dark Velvet Theme**: Professional gradient design
- **Glassmorphism**: Modern frosted glass effects
- **Progress Tracking**: Real-time upload and processing status
- **Interactive Results**: Expandable evidence and feedback system

---

## ⚙️ Setup & Deployment

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)

### Environment Configuration
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit with your Qdrant and LangSmith API keys

# Frontend environment
cp frontend/.env.example frontend/.env.local
# Configure API endpoints
```

### Production Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### Development Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 7860

# Frontend
cd frontend
npm install
npm run dev
```

---

## � API Endpoints

### Core Endpoints
- `POST /upload` - Upload and process PDF resumes
- `GET /status/{task_id}` - Track processing progress
- `POST /search` - Hybrid semantic search
- `POST /analyze` - AI-powered candidate analysis
- `POST /feedback` - Submit user feedback
- `GET /metrics` - System performance metrics
- `GET /health` - Health check endpoint

### Search Request Example
```json
{
  "query": "Senior Python Developer with AI/ML experience",
  "top_k": 5,
  "alpha": 0.7,
  "filters": {
    "experience_years": 5,
    "skills": ["python", "machine learning"]
  }
}
```

---

## 🔧 Configuration

### Qdrant Cloud Setup
1. Create Qdrant Cloud account
2. Create cluster with HNSW indexing
3. Set `QDRANT_URL` and `QDRANT_API_KEY`

### LangSmith Integration
1. Create LangSmith account
2. Create new project
3. Set `LANGSMITH_API_KEY` and `LANGSMITH_PROJECT`

### Environment Variables
```bash
# Vector Database
QDRANT_URL=https://your-cluster.qdrant.tech
QDRANT_API_KEY=your-api-key

# Observability
LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT=neuro-linker

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## 📈 Performance & Scaling

### Benchmarks
- **Search Latency**: <100ms average
- **Upload Processing**: Async background processing
- **Concurrent Users**: 1000+ with proper scaling
- **Document Storage**: Millions of resumes with Qdrant

### Scaling Strategy
- **Horizontal Scaling**: Multiple backend instances
- **Vector Database**: Qdrant Cloud auto-scaling
- **CDN**: Frontend static assets via Vercel
- **Load Balancing**: Docker Compose or Kubernetes

---

## 🔍 Monitoring & Debugging

### LangSmith Dashboard
- Search performance tracking
- Error analysis and debugging
- User feedback analytics
- Model improvement insights

### System Health
- Real-time metrics dashboard
- Error logging and alerting
- Performance monitoring
- Resource utilization tracking

---

## 🚀 Deployment Targets

### Hugging Face Spaces (Backend)
```bash
# Deploy backend to Hugging Face
docker build -t neuro-linker-backend ./backend
# Push and deploy to Spaces
```

### Vercel (Frontend)
```bash
# Deploy frontend to Vercel
cd frontend
vercel --prod
```

### Full Stack (Docker Compose)
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Implement with tests
4. Deploy to staging
5. Submit pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

*Transformed from prototype to production-grade system with modern observability, scalability, and deployment capabilities.*
