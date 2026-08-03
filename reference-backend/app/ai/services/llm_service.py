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


def get_llm() -> BaseChatModel:
    """
    Instantiates and returns the configured ChatModel.
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
            raise ValueError("OPENROUTER_API_KEY is not set in environment or config.")
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            openai_api_key=settings.openrouter_api_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )

    elif provider == "gemini":
        if not settings.google_api_key:
            raise ValueError("GOOGLE_API_KEY is not set in environment or config.")
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.google_api_key,
            temperature=settings.llm_temperature,
            max_output_tokens=settings.llm_max_tokens,
        )

    elif provider == "openai":
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not set in environment or config.")
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            openai_api_key=settings.openai_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )

    elif provider == "anthropic":
        if not settings.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY is not set in environment or config.")
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=settings.llm_model,
            anthropic_api_key=settings.anthropic_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )

    else:
        raise ValueError(f"Unsupported LLM_PROVIDER '{provider}'. Supported: openrouter, gemini, openai, anthropic.")
