from typing import Optional
from app.core.llm import llm_client
from app.core.prompts import get_prompt, LEGAL_DISCLAIMER_AR, LEGAL_DISCLAIMER_EN


class LegalAssistantAgent:
    def __init__(self):
        self.llm = llm_client
        self.system_prompt = get_prompt("legal_assistant")

    async def process(
        self,
        message: str,
        context: Optional[dict] = None,
        language: str = "ar",
    ) -> dict:
        prompt = f"""User question: {message}

Context: {context or {}}

Provide a helpful, well-cited legal response."""

        response = self.llm.generate(
            [{"role": "user", "content": prompt}],
            system_prompt=self.system_prompt,
        )

        disclaimer = LEGAL_DISCLAIMER_AR if language == "ar" else LEGAL_DISCLAIMER_EN

        return {
            "response": response,
            "disclaimer": disclaimer,
            "language": language,
            "sources": [],
        }
