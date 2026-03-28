from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: user, assistant, or system")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    session_id: Optional[str] = None
    tenant_id: Optional[str] = None
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    message: str
    session_id: str
    sources: Optional[list[dict]] = None
    disclaimer: str = Field(default=LEGAL_DISCLAIMER_AR)


class Source(BaseModel):
    document_id: str
    content: str
    score: float
    metadata: Optional[dict] = None
