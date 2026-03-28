import pytest
from app.services.document_processor import DocumentProcessor


@pytest.fixture
def processor():
    return DocumentProcessor()


@pytest.mark.asyncio
async def test_extract_text_from_plain_text(processor):
    content = b"Hello, this is a test document."
    text = await processor.extract_text(content, "text/plain")
    
    assert text == "Hello, this is a test document."


def test_chunk_text(processor):
    text = "Hello world! This is a test. " * 100
    chunks = processor.chunk_text(text, chunk_size=50, overlap=10)
    
    assert len(chunks) > 1
    assert all(isinstance(chunk, str) for chunk in chunks)
