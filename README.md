# COLS - Collaborative Online Legal System

A comprehensive legal practice management platform with AI-powered assistance.

## Architecture Overview

```
cols-ai/
├── backend/         # NestJS API
├── frontend/        # Next.js App
├── ai-service/      # Python FastAPI
├── docs/            # Documentation
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

## Quick Start

### Development

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   cp ai-service/.env.example ai-service/.env
   ```

3. Start with Docker Compose:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. Or run services individually:
   ```bash
   # Backend (Port 3000)
   cd backend && npm install && npm run start:dev
   
   # Frontend (Port 3001)
   cd frontend && npm install && npm run dev
   
   # AI Service (Port 8000)
   cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload
   ```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3001 | Next.js application |
| Backend | 3000 | NestJS API |
| AI Service | 8000 | FastAPI AI endpoints |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & Queue |
| MinIO | 9000 | S3-compatible storage |

## Environment Variables

See individual service `.env.example` files for required variables.

## Documentation

- [Architecture](docs/architecture.md)
- [API Documentation](http://localhost:3000/api/docs)
- [AGENTS.md](docs/AGENTS.md) - AI agent guidelines
