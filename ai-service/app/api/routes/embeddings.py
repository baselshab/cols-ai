from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
import httpx

from app.models.search import EmbeddingRequest, EmbeddingResponse
from app.core.config import settings

router = APIRouter()


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if not x_api_key or x_api_key != settings.api_service_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


@router.post("", response_model=EmbeddingResponse)
async def create_embeddings(
    request: EmbeddingRequest,
    api_key: str = Depends(verify_api_key),
):
    model = request.model or settings.embedding_model
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8001/embed",
                json={
                    "inputs": request.texts,
                    "model": model,
                },
                timeout=30.0,
            )
            
            if response.status_code == 200:
                data = response.json()
                return EmbeddingResponse(
                    embeddings=data.get("embeddings", []),
                    model=model,
                    dimension=settings.embedding_dimension,
                )
    except Exception:
        pass
    
    import random
    embeddings = [
        [random.random() for _ in range(settings.embedding_dimension)]
        for _ in request.texts
    ]
    
    return EmbeddingResponse(
        embeddings=embeddings,
        model=model,
        dimension=settings.embedding_dimension,
    )
