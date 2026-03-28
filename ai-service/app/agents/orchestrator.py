from typing import Optional
from app.core.llm import llm_client
from app.core.prompts import get_prompt


class OrchestratorAgent:
    def __init__(self):
        self.llm = llm_client
        self.system_prompt = """You are the orchestrator for COLS AI. Your role is to:
1. Understand the user's intent
2. Route to the appropriate specialist agent
3. Synthesize responses from multiple agents
4. Ensure consistent, well-cited responses

Available agents:
- legal_assistant: General legal questions
- document_analyzer: Analyze legal documents
- case_summary: Summarize cases
- contract_review: Review contracts
- research: Legal research"""

    async def process(self, message: str, context: Optional[dict] = None) -> dict:
        routing_prompt = f"""Based on this user message, determine the appropriate agent:
Message: {message}

Respond with only the agent name: legal_assistant, document_analyzer, case_summary, contract_review, or research"""

        agent_name = self.llm.generate(
            [{"role": "user", "content": routing_prompt}],
            system_prompt="You are a routing assistant. Return only the agent name.",
        ).strip().lower()

        if "document" in agent_name:
            agent_name = "document_analyzer"
        elif "case" in agent_name:
            agent_name = "case_summary"
        elif "contract" in agent_name:
            agent_name = "contract_review"
        elif "research" in agent_name:
            agent_name = "research"
        else:
            agent_name = "legal_assistant"

        return {
            "agent": agent_name,
            "message": message,
            "context": context or {},
        }
