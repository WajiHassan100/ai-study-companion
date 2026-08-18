"""
AI Utility Functions
====================
Provides shared utility functions for AI agent operations, structured LLM output parsing,
and text cleaning across the multi-agent ecosystem.
"""

import logging

logger = logging.getLogger(__name__)


class AgentOutputError(RuntimeError):
    """
    Raised when an AI agent cannot produce a valid structured output
    (LLM call failed or the output did not match the expected schema).

    Agents must raise this instead of returning canned/fabricated results,
    so callers surface a real error to the user.
    """


def clean_llm_json(raw_text: str) -> str:
    """
    Cleans raw text output from an LLM by stripping markdown code fences (```json ... ```)
    and surrounding whitespace to ensure clean JSON deserialization.

    Args:
        raw_text: The raw string response from an LLM.

    Returns:
        A cleaned string ready for json.loads().
    """
    if not raw_text:
        return "{}"

    text = raw_text.strip()

    # Remove opening markdown code fence
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]

    # Remove closing markdown code fence
    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def robust_parse_json(
    raw_text: str,
    llm=None,
    fallback: dict | None = None,
) -> dict:
    """
    Attempts to parse LLM output as JSON with multiple fallback strategies:
    1. Direct clean + parse via clean_llm_json
    2. LLM-assisted repair (if llm instance provided)
    3. Final fallback dict

    Args:
        raw_text: Raw string response from an LLM.
        llm: Optional LangChain LLM instance for repair attempts.
        fallback: Dict to return if all parsing attempts fail.

    Returns:
        Parsed dictionary from the LLM output.
    """
    import json

    if not raw_text:
        return fallback or {}

    # Strategy 1: Direct clean + parse
    try:
        cleaned = clean_llm_json(raw_text)
        return json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        logger.debug("Direct JSON parse failed, attempting repair...")

    # Strategy 2: LLM-assisted repair (costs ~200 tokens, saves the response)
    if llm is not None:
        try:
            from langchain_core.messages import HumanMessage

            repair_prompt = (
                "The following text was supposed to be valid JSON but has syntax errors. "
                "Fix the JSON and return ONLY the corrected JSON object, nothing else. "
                "Do not add markdown fences or explanations.\n\n"
                f"{raw_text[:3000]}"
            )
            repair_msg = llm.invoke([HumanMessage(content=repair_prompt)])
            repair_text = clean_llm_json(repair_msg.content.strip())
            result = json.loads(repair_text)
            logger.info("LLM JSON repair succeeded.")
            return result
        except Exception as repair_err:
            logger.warning("LLM JSON repair also failed: %s", repair_err)

    # Strategy 3: Final fallback
    logger.warning("All JSON parsing strategies exhausted. Returning fallback.")
    return fallback or {}

