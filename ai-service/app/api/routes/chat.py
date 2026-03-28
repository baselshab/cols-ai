from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

from app.models.chat import ChatRequest, ChatResponse, ChatMessage
from app.core.llm import llm_client
from app.core.prompts import get_prompt, LEGAL_DISCLAIMER_AR, LEGAL_DISCLAIMER_EN
from app.services.vector_store import VectorStoreService

router = APIRouter()


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    from app.core.config import settings
    if not x_api_key or x_api_key != settings.api_service_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key),
):
    session_id = request.session_id or f"session-{id(request)}"
    
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]
    
    system_prompt = get_prompt("legal_assistant")
    
    response_text = llm_client.generate(messages, system_prompt=system_prompt)
    
    disclaimer = LEGAL_DISCLAIMER_AR
    if request.messages and any(w in request.messages[-1].content.lower() for w in ["english", "in english"]):
        disclaimer = LEGAL_DISCLAIMER_EN
    
    return ChatResponse(
        message=response_text,
        session_id=session_id,
        disclaimer=disclaimer,
    )


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key),
):
    session_id = request.session_id or f"session-{id(request)}"
    
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]
    
    system_prompt = get_prompt("legal_assistant")
    
    def generate():
        for chunk in llm_client.generate_stream(messages, system_prompt=system_prompt):
            yield f"data: {chunk}\n\n"
        yield f"data: [DONE]\n\n"
    
    return generate()
