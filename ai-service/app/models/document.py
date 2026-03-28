from pydantic import BaseModel, Field
from typing import Optional


class DocumentUploadResponse(BaseModel):
    document_id: str
    status: str
    filename: str


class DocumentAnalysisRequest(BaseModel):
    document_id: str
    tenant_id: str
    analysis_type: str = "full"


class DocumentAnalysisResponse(BaseModel):
    document_id: str
    summary: str
    key_points: list[str]
    entities: dict
    legal_issues: list[str]
    confidence: float
