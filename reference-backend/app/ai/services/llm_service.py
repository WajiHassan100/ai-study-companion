"""
LLM Service Factory
===================

Provides a unified interface to instantiate LangChain BaseChatModel objects
across multiple providers: OpenRouter, Google Gemini, OpenAI, and Anthropic.
"""

import logging
from langchain_core.language_models.chat_models import BaseChatModel

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class MissingAPIKeyLLM:
    """Placeholder LLM that raises a clear configuration error on invocation if API key is missing."""

    def __init__(self, key_name: str):
        self.key_name = key_name

    async def ainvoke(self, input_messages, config=None, **kwargs):
        raise ValueError(f"Configuration Error: '{self.key_name}' is not set in .env file. Please add your API key to .env to execute AI requests.")

    def invoke(self, input_messages, config=None, **kwargs):
        raise ValueError(f"Configuration Error: '{self.key_name}' is not set in .env file. Please add your API key to .env to execute AI requests.")


def get_llm() -> BaseChatModel:
    """
    Instantiates and returns the configured ChatModel.
    Returns MissingAPIKeyLLM if the required API key is missing, avoiding startup crashes.
    """
    settings = get_settings()
    provider = settings.llm_provider.lower()

    logger.info(
        "Initialising LLM provider=%s model=%s temp=%.2f",
        provider,
        settings.llm_model,
        settings.llm_temperature,
    )

    if provider == "openrouter":
        if not settings.openrouter_api_key:
            logger.warning("OPENROUTER_API_KEY is missing from environment/config.")
            return MissingAPIKeyLLM("OPENROUTER_API_KEY") # type: ignore
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            openai_api_key=settings.openrouter_api_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.3,
            max_tokens=settings.llm_max_tokens,
            request_timeout=15.0,
            max_retries=1,
        )

    elif provider == "gemini":
        if not settings.google_api_key:
            logger.warning("GOOGLE_API_KEY is missing from environment/config.")
            return MissingAPIKeyLLM("GOOGLE_API_KEY") # type: ignore
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.google_api_key,
            temperature=settings.llm_temperature,
            max_output_tokens=settings.llm_max_tokens,
        )

    elif provider == "openai":
        if not settings.openai_api_key:
            logger.warning("OPENAI_API_KEY is missing from environment/config.")
            return MissingAPIKeyLLM("OPENAI_API_KEY") # type: ignore
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            openai_api_key=settings.openai_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )

    elif provider == "anthropic":
        if not settings.anthropic_api_key:
            logger.warning("ANTHROPIC_API_KEY is missing from environment/config.")
            return MissingAPIKeyLLM("ANTHROPIC_API_KEY") # type: ignore
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=settings.llm_model,
            anthropic_api_key=settings.anthropic_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )

    else:
        raise ValueError(f"Unsupported LLM_PROVIDER '{provider}'. Supported: openrouter, gemini, openai, anthropic.")
