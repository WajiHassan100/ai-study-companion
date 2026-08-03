"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Personal AI School Assistant API"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "sqlite:///./school_assistant.db"

    # Auth
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"]

    # AI Configuration & Multi-Provider Keys
    llm_provider: str = "openrouter"
    llm_model: str = "google/gemini-2.5-flash"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 4096

    openrouter_api_key: str | None = "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"
    openai_api_key: str | None = None
    google_api_key: str | None = None
    anthropic_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
