# COLS AI Service

FastAPI-based AI service for the Collaborative Online Legal System.

## Tech Stack

- **Framework**: FastAPI 0.109+
- **LLM**: Anthropic Claude / OpenAI GPT
- **Embeddings**: multilingual-e5-large
- **Database**: PostgreSQL + pgvector
- **Queue**: Redis + Celery

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Configure your API keys in .env
```

## Running

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Chat with AI assistant |
| `/api/documents/analyze` | POST | Analyze a document |
| `/api/embeddings` | POST | Generate embeddings |
| `/api/search` | POST | Vector similarity search |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `API_SERVICE_API_KEY` | Internal API authentication |

## Testing

```bash
pytest tests/ -v
```
