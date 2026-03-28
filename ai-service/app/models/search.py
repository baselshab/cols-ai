from pydantic import BaseModel, Field
from typing import Optional


class EmbeddingRequest(BaseModel):
    texts: list[str]
    model: Optional[str] = None


class EmbeddingResponse(BaseModel):
    embeddings: list[list[float]]
    model: str
    dimension: int


class VectorSearchRequest(BaseModel):
    query: str
    tenant_id: str
    limit: int = 5
    case_id: Optional[str] = None
    document_id: Optional[str] = None


class SearchResult(BaseModel):
    content: str
    document_id: str
    chunk_index: int
    score: float
    metadata: dict
