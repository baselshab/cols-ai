from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "COLS AI Service"
    debug: bool = False
    
    database_url: str = "postgresql://postgres:postgres@localhost:5432/cols_ai"
    redis_url: str = "redis://localhost:6379"
    
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    
    api_service_api_key: str = "ai-service-api-key"
    
    llm_provider: str = "anthropic"
    llm_model: str = "claude-3-sonnet-20240229"
    
    max_tokens: int = 4096
    temperature: float = 0.7
    
    embedding_model: str = "intfloat/multilingual-e5-large"
    embedding_dimension: int = 1024

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
