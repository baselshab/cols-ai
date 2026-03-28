from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

from app.models.search import VectorSearchRequest, SearchResult
from app.services.vector_store import VectorStoreService
from app.services.embedding import EmbeddingService

router = APIRouter()


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    from app.core.config import settings
    if not x_api_key or x_api_key != settings.api_service_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


@router.post("", response_model=list[SearchResult])
async def search_vectors(
    request: VectorSearchRequest,
    api_key: str = Depends(verify_api_key),
):
    embedding_service = EmbeddingService()
    vector_service = VectorStoreService()
    
    query_embedding = await embedding_service.get_embedding(request.query)
    
    results = await vector_service.search(
        tenant_id=request.tenant_id,
        query_embedding=query_embedding,
        limit=request.limit,
        case_id=request.case_id,
        document_id=request.document_id,
    )
    
    return results


@router.get("/suggestions")
async def get_suggestions(
    q: str,
    tenant_id: str,
    api_key: str = Depends(verify_api_key),
):
    suggestions = [
        f"Suggestion for: {q}",
        f"Related to: {q}",
        f"Similar search: {q}",
    ]
    return {"suggestions": suggestions[:3]}
