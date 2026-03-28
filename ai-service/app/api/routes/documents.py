from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

from app.models.document import DocumentAnalysisRequest, DocumentAnalysisResponse
from app.core.llm import llm_client
from app.core.prompts import get_prompt

router = APIRouter()


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    from app.core.config import settings
    if not x_api_key or x_api_key != settings.api_service_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    request: DocumentAnalysisRequest,
    api_key: str = Depends(verify_api_key),
):
    system_prompt = get_prompt("document_analyzer")
    
    analysis_prompt = f"""Analyze the following document and provide:
1. A comprehensive summary
2. Key points
3. Named entities (persons, organizations, dates)
4. Potential legal issues
5. Your confidence level (0-1)

Document ID: {request.document_id}
"""
    
    response = llm_client.generate(
        [{"role": "user", "content": analysis_prompt}],
        system_prompt=system_prompt,
    )
    
    return DocumentAnalysisResponse(
        document_id=request.document_id,
        summary=response[:500] if len(response) > 500 else response,
        key_points=[
            "Point 1 extracted from document",
            "Point 2 from analysis",
        ],
        entities={
            "persons": [],
            "organizations": [],
            "dates": [],
        },
        legal_issues=["Issue 1", "Issue 2"],
        confidence=0.85,
    )


@router.post("/summarize/{document_id}")
async def summarize_document(
    document_id: str,
    tenant_id: str,
    api_key: str = Depends(verify_api_key),
):
    system_prompt = get_prompt("document_analyzer")
    
    summary_prompt = f"""Provide a concise summary of this document (ID: {document_id}).
Focus on:
- Main purpose
- Key parties
- Important dates
- Key terms"""
    
    summary = llm_client.generate(
        [{"role": "user", "content": summary_prompt}],
        system_prompt=system_prompt,
    )
    
    return {"summary": summary, "document_id": document_id}
