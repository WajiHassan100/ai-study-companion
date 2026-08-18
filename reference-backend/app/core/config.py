"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Personal AI School Assistant API"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "sqlite:///./school_assistant.db"

    # Auth — no default: Pydantic will raise a clear ValidationError
    # if JWT_SECRET_KEY is missing from .env, preventing silent insecurity.
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Optional Supabase JWT secret (SUPABASE_JWT_SECRET from the Supabase
    # project settings). When set, the backend also accepts Supabase-issued
    # access tokens, so the frontend's existing Authorization header works
    # and user ids map directly to Supabase auth.users ids.
    supabase_jwt_secret: str | None = None

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"]

    # AI Configuration & Multi-Provider Keys
    llm_provider: str = "openrouter"
    llm_model: str = "google/gemini-2.5-flash"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 4096

    openrouter_api_key: str | None = None
    openai_api_key: str | None = None
    google_api_key: str | None = None
    gemini_api_key: str | None = None
    anthropic_api_key: str | None = None

    @model_validator(mode="after")
    def _sync_google_gemini_key(self) -> "Settings":
        """Allow either GEMINI_API_KEY or GOOGLE_API_KEY in .env — keep both in sync."""
        if self.google_api_key and not self.gemini_api_key:
            object.__setattr__(self, "gemini_api_key", self.google_api_key)
        elif self.gemini_api_key and not self.google_api_key:
            object.__setattr__(self, "google_api_key", self.gemini_api_key)
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
