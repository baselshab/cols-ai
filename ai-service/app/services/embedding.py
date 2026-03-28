import httpx
from typing import Optional
from app.core.config import settings


class EmbeddingService:
    def __init__(self):
        self.model = settings.embedding_model
        self.dimension = settings.embedding_dimension
    
    async def get_embedding(self, text: str) -> list[float]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8001/embed",
                    json={
                        "inputs": [text],
                        "model": self.model,
                    },
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("embeddings", [[0.0] * self.dimension])[0]
        except Exception:
            pass
        
        import random
        return [random.random() for _ in range(self.dimension)]
    
    async def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8001/embed",
                    json={
                        "inputs": texts,
                        "model": self.model,
                    },
                    timeout=60.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("embeddings", [[0.0] * self.dimension] * len(texts))
        except Exception:
            pass
        
        import random
        return [[random.random() for _ in range(self.dimension)] for _ in texts]
