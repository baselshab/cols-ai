import io
from typing import Optional


class DocumentProcessor:
    def __init__(self):
        self.supported_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/html",
        ]
    
    async def process(
        self,
        file_content: bytes,
        filename: str,
        mime_type: str,
    ) -> dict:
        text = await self.extract_text(file_content, mime_type)
        chunks = self.chunk_text(text)
        
        return {
            "text": text,
            "chunks": chunks,
            "metadata": {
                "filename": filename,
                "mime_type": mime_type,
                "size": len(file_content),
            },
        }
    
    async def extract_text(self, content: bytes, mime_type: str) -> str:
        if mime_type == "text/plain":
            return content.decode("utf-8", errors="ignore")
        
        return f"Extracted text from {mime_type} document (placeholder)"
    
    def chunk_text(
        self,
        text: str,
        chunk_size: int = 1000,
        overlap: int = 200,
    ) -> list[str]:
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk.strip())
            start = end - overlap
        
        return chunks


class OCRService:
    async def process_image(self, image_content: bytes) -> str:
        return "Extracted text from image using OCR (placeholder)"
