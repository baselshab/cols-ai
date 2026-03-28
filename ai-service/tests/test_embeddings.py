import pytest
from app.services.embedding import EmbeddingService


@pytest.fixture
def service():
    return EmbeddingService()


@pytest.mark.asyncio
async def test_get_embedding(service):
    embedding = await service.get_embedding("Hello, world!")
    
    assert isinstance(embedding, list)
    assert len(embedding) > 0


@pytest.mark.asyncio
async def test_get_embeddings(service):
    embeddings = await service.get_embeddings(["Hello", "World"])
    
    assert isinstance(embeddings, list)
    assert len(embeddings) == 2
