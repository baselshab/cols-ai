import pytest
from app.agents.legal_assistant import LegalAssistantAgent


@pytest.fixture
def agent():
    return LegalAssistantAgent()


@pytest.mark.asyncio
async def test_legal_assistant_process(agent):
    result = await agent.process(
        message="What are the requirements for forming a contract?",
        language="en",
    )
    
    assert "response" in result
    assert "disclaimer" in result
    assert result["language"] == "en"


@pytest.mark.asyncio
async def test_legal_assistant_arabic(agent):
    result = await agent.process(
        message="ما هي متطلبات تشكيل العقد؟",
        language="ar",
    )
    
    assert "response" in result
    assert "disclaimer" in result
    assert "Arabic" in result["disclaimer"] or "arabic" in result["disclaimer"].lower()
