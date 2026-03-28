import anthropic
from typing import Optional, Generator
from app.core.config import settings

SYSTEM_PROMPT = """You are a legal assistant for the COLS (Collaborative Online Legal System). 
Your role is to help legal professionals with research, document analysis, and case management.

IMPORTANT GUIDELINES:
1. NEVER provide definitive legal advice without citing sources
2. Always cite specific documents and sections when making legal claims
3. Use Arabic language unless the user writes in English
4. Include appropriate legal disclaimers
5. Be precise and thorough in your responses
6. If you're uncertain about a legal matter, indicate the level of confidence

You have access to:
- Case documents and records
- Legal research databases
- Previous case summaries
- Client information (with privacy considerations)

Remember to maintain attorney-client privilege in all interactions."""

SYSTEM_PROMPT_EN = """You are a legal assistant for the COLS (Collaborative Online Legal System).
Help legal professionals with research, document analysis, and case management.

IMPORTANT:
1. NEVER provide definitive legal advice without citing sources
2. Always cite specific documents and sections
3. If uncertain, indicate confidence level
4. Include appropriate legal disclaimers"""


class LLMClient:
    def __init__(self):
        self.anthropic_client = anthropic.Anthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None
    
    def generate(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None,
        temperature: float = None,
        max_tokens: int = None,
    ) -> str:
        if not self.anthropic_client:
            return self._mock_response(messages)
        
        combined_system = system_prompt or SYSTEM_PROMPT
        
        response = self.anthropic_client.messages.create(
            model=settings.llm_model,
            max_tokens=max_tokens or settings.max_tokens,
            temperature=temperature or settings.temperature,
            system=combined_system,
            messages=messages,
        )
        
        return response.content[0].text
    
    def generate_stream(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None,
    ) -> Generator[str, None, None]:
        if not self.anthropic_client:
            yield self._mock_response(messages)
            return
        
        combined_system = system_prompt or SYSTEM_PROMPT
        
        with self.anthropic_client.messages.stream(
            model=settings.llm_model,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            system=combined_system,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield text
    
    def _mock_response(self, messages: list[dict]) -> str:
        last_message = messages[-1]["content"] if messages else "Hello"
        return f"AI Response to: {last_message[:50]}... (Configure API keys for full functionality)"


llm_client = LLMClient()
