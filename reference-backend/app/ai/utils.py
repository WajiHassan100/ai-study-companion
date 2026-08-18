"""
AI Utility Functions
====================
Provides shared utility functions for AI agent operations, structured LLM output parsing,
instant zero-latency JSON repair, and text cleaning across the multi-agent ecosystem.
"""

import json
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)


class AgentOutputError(RuntimeError):
    """
    Raised when an AI agent cannot produce a valid structured output
    (LLM call failed or the output did not match the expected schema).
    """


def clean_llm_json(raw_text: str) -> str:
    """
    Cleans raw text output from an LLM by stripping markdown code fences (```json ... ```)
    and surrounding whitespace to ensure clean JSON deserialization.
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


def sanitize_json_string(text: str) -> str:
    """
    Sanitizes common LLM JSON syntax errors in-memory with zero network latency:
    - Strips code fences
    - Normalizes smart quotes
    - Removes trailing commas before } or ]
    - Escapes unescaped LaTeX/math backslashes (\frac, \nabla, \alpha, \sum)
    """
    if not text:
        return "{}"

    t = clean_llm_json(text)

    # Normalize Unicode quotes
    t = t.replace("\u201c", '"').replace("\u201d", '"').replace("\u2018", "'").replace("\u2019", "'")

    # Remove trailing commas before closing braces/brackets
    t = re.sub(r",\s*([\}\]])", r"\1", t)

    # Escape invalid backslashes that are not standard JSON escape characters (\", \\, \/, \b, \f, \n, \r, \t, \uXXXX)
    t = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r"\\\\", t)

    return t


def extract_questions_fallback(raw_text: str) -> list[dict[str, Any]]:
    """
    Regex-based recovery to extract questions if JSON is structurally broken:
    Extracts individual JSON question objects from the text.
    """
    questions = []
    
    # Try finding the questions array block
    match = re.search(r'"questions"\s*:\s*\[([\s\S]*?)\]\s*(?:\}|$)', raw_text)
    block_to_search = match.group(1) if match else raw_text

    # Match individual question objects { ... }
    obj_matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', block_to_search)
    for idx, obj_str in enumerate(obj_matches, 1):
        try:
            sanitized = sanitize_json_string(obj_str)
            item = json.loads(sanitized)
            if isinstance(item, dict) and "question" in item:
                if "id" not in item:
                    item["id"] = f"q{idx}"
                questions.append(item)
        except Exception:
            continue

    return questions


def robust_parse_json(
    raw_text: str,
    llm=None,
    fallback: dict | None = None,
) -> dict:
    """
    Attempts to parse LLM output as JSON with multi-level resilient fallback:
    1. Direct clean + parse
    2. Zero-latency in-memory string sanitization (LaTeX backslashes, trailing commas)
    3. Partial question/entity extraction
    4. Fallback dict
    """
    if not raw_text:
        return fallback or {}

    # Strategy 1: Direct clean + parse
    try:
        cleaned = clean_llm_json(raw_text)
        return json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        pass

    # Strategy 2: Fast in-memory sanitization
    try:
        sanitized = sanitize_json_string(raw_text)
        return json.loads(sanitized)
    except (json.JSONDecodeError, ValueError):
        pass

    # Strategy 3: Question array block extraction
    recovered_qs = extract_questions_fallback(raw_text)
    if recovered_qs:
        logger.info("Successfully recovered %d questions using regex fallback parser", len(recovered_qs))
        return {
            "title": "Practice Assessment",
            "topic": "Assessment",
            "difficulty": "medium",
            "questions": recovered_qs,
        }

    return fallback or {}
