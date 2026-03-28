from typing import Optional
from app.core.llm import llm_client
from app.core.prompts import get_prompt


class DocumentAnalyzerAgent:
    def __init__(self):
        self.llm = llm_client
        self.system_prompt = get_prompt("document_analyzer")

    async def analyze(
        self,
        document_id: str,
        document_content: str,
        analysis_type: str = "full",
    ) -> dict:
        prompt = f"""Analyze this document (ID: {document_id})

Document content:
{document_content[:4000]}

Analysis type: {analysis_type}

Provide:
1. Summary
2. Key points
3. Named entities (persons, organizations, dates)
4. Potential legal issues
5. Confidence level (0-1)"""

        response = self.llm.generate(
            [{"role": "user", "content": prompt}],
            system_prompt=self.system_prompt,
        )

        return {
            "document_id": document_id,
            "analysis": response,
            "summary": response[:500],
            "entities": {
                "persons": [],
                "organizations": [],
                "dates": [],
            },
            "legal_issues": [],
            "confidence": 0.85,
        }

    async def extract_clauses(self, document_content: str) -> list[dict]:
        prompt = f"""Extract key clauses from this legal document:

{document_content[:4000]}

For each clause provide:
- Title
- Summary
- Key terms
- Potential implications"""

        response = self.llm.generate(
            [{"role": "user", "content": prompt}],
            system_prompt="You are a legal document analyst specializing in clause extraction.",
        )

        return [
            {
                "title": "Extracted Clause",
                "summary": response[:200],
                "key_terms": [],
                "implications": [],
            }
        ]
