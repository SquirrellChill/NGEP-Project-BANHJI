# """API keys, model names, and tunables. No logic beyond loading/validating."""

# import os
# import sys
# from functools import lru_cache

# from dotenv import load_dotenv

# load_dotenv()

# # Khmer script prints as mojibake on Windows consoles without this.
# # Note: the VS Code *terminal* often still can't render Khmer glyphs even with
# # correct encoding — write to a .txt file and open it in the editor pane instead.
# try:
#     sys.stdout.reconfigure(encoding="utf-8")
# except (AttributeError, ValueError):
#     pass


# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# # --- Model selection -------------------------------------------------------
# # ASR_BACKEND picks how transcriber.py talks to Gemini:
# #   "prompted"   -> generate_content with an explicit transcription prompt
# #   "transcribe" -> the dedicated transcription endpoint (no prompt field)
# # Swapping to Smean later means adding a third branch in transcriber.py ONLY.
# ASR_BACKEND = os.getenv("ASR_BACKEND", "prompted")

# ASR_PROMPTED_MODEL = os.getenv("ASR_PROMPTED_MODEL", "gemini-3.5-flash-lite")
# ASR_TRANSCRIBE_MODEL = os.getenv("ASR_TRANSCRIBE_MODEL", "gemini-3.5-transcribe")
# EXTRACTION_MODEL = os.getenv("EXTRACTION_MODEL", "gemini-3.5-flash-lite")


# # --- Record schema ---------------------------------------------------------
# # Per line item. `date` belongs to the sale as a whole, not to a line.
# LINE_FIELDS = ("item", "quantity", "unit", "price", "currency", "price_basis")

# # Always asked about if missing.
# REQUIRED_FIELDS = ("item", "quantity", "price")

# # Asked about only once a price exists. A bare number with no currency is
# # worse than a missing one — it silently mixes riel and dollars in the same
# # column and every total computed from it is wrong.
# CONDITIONAL_FIELDS = {"currency": "price"}

# # Not asked about. `unit` is descriptive, and `price_basis` is a binary the
# # confirmation screen can toggle far more cheaply than a spoken follow-up.
# OPTIONAL_FIELDS = ("unit", "price_basis")

# VALID_CURRENCIES = ("KHR", "USD")
# VALID_PRICE_BASIS = ("unit", "total")

# # Guard against a model that hallucinates a runaway list of products.
# MAX_ITEMS = int(os.getenv("MAX_ITEMS", "10"))

# # Cap on catalogue names fed into the transcription prompt. Every name is an
# # input token on every recording.
# MAX_CATALOG_HINTS = int(os.getenv("MAX_CATALOG_HINTS", "40"))


# # --- Clarification loop ----------------------------------------------------
# # Hard cap. After this many follow-ups we hand off to manual entry rather
# # than looping. The one-time confirmation step is NOT counted here.
# MAX_FOLLOWUP_ATTEMPTS = int(os.getenv("MAX_FOLLOWUP_ATTEMPTS", "3"))


# # --- Network ---------------------------------------------------------------
# # Free tier: 429 (rate limit) and 503 (overloaded) are both expected.
# # Bounded backoff only — an unbounded retry loop is where worst-case latency hides.
# MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))

# # Deterministic output. Without this the SDK default sampling makes the same
# # audio produce different records on different runs, which means an evaluation
# # set measures noise instead of measuring the prompt.
# TEMPERATURE = float(os.getenv("TEMPERATURE", "0"))
# RETRY_BASE_DELAY_S = float(os.getenv("RETRY_BASE_DELAY_S", "0.75"))


# def validate() -> None:
#     """Fail loudly at startup rather than on the first seller's request."""
#     if not GEMINI_API_KEY:
#         raise RuntimeError(
#             "GEMINI_API_KEY is not set. Copy .env.example to .env and fill it in. "
#             "Never commit .env."
#         )
#     if ASR_BACKEND not in ("prompted", "transcribe"):
#         raise RuntimeError(
#             f"ASR_BACKEND must be 'prompted' or 'transcribe', got {ASR_BACKEND!r}"
#         )


# @lru_cache(maxsize=1)
# def get_client():
#     """Single shared Gemini client.

#     Built once and cached. Constructing a client per request costs a fresh
#     connection setup on every sale, which is pure latency for no benefit.
#     """
#     from google import genai

#     validate()
#     return genai.Client(api_key=GEMINI_API_KEY)


# def generation_config():
#     """Shared generation settings for every Gemini call."""
#     from google.genai import types

#     return types.GenerateContentConfig(temperature=TEMPERATURE)


# def call_with_retry(fn, *, what: str):
#     """Run a Gemini call with bounded exponential backoff.

#     Lives here rather than in a new module so we don't add a top-level file
#     just to hold six lines shared by transcriber.py and extractor.py.
#     """
#     import time

#     last_error = None
#     for attempt in range(MAX_RETRIES + 1):
#         try:
#             return fn()
#         except Exception as exc:  # SDK raises transport-specific types
#             last_error = exc
#             message = str(exc)
#             retryable = "429" in message or "503" in message or "RESOURCE_EXHAUSTED" in message
#             if not retryable or attempt == MAX_RETRIES:
#                 break
#             time.sleep(RETRY_BASE_DELAY_S * (2**attempt))

#     raise RuntimeError(f"{what} failed after {MAX_RETRIES + 1} attempts: {last_error}")


"""API keys, model names, and tunables. No logic beyond loading/validating."""

import os
import sys
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()

# Khmer script prints as mojibake on Windows consoles without this.
# Note: the VS Code *terminal* often still can't render Khmer glyphs even with
# correct encoding — write to a .txt file and open it in the editor pane instead.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# --- Model selection -------------------------------------------------------
# ASR_BACKEND picks how transcriber.py talks to Gemini:
#   "prompted"   -> generate_content with an explicit transcription prompt
#   "transcribe" -> the dedicated transcription endpoint (no prompt field)
# Swapping to Smean later means adding a third branch in transcriber.py ONLY.
ASR_BACKEND = os.getenv("ASR_BACKEND", "prompted")

ASR_PROMPTED_MODEL = os.getenv("ASR_PROMPTED_MODEL", "gemini-3.5-flash-lite")
ASR_TRANSCRIBE_MODEL = os.getenv("ASR_TRANSCRIBE_MODEL", "gemini-3.5-transcribe")
EXTRACTION_MODEL = os.getenv("EXTRACTION_MODEL", "gemini-3.5-flash-lite")


# --- Record schema ---------------------------------------------------------
# Per line item. `date` belongs to the sale as a whole, not to a line.
LINE_FIELDS = ("item", "quantity", "unit", "price", "currency", "price_basis")

# Always asked about if missing.
REQUIRED_FIELDS = ("item", "quantity", "price")

# Asked about only once a price exists. A bare number with no currency is
# worse than a missing one — it silently mixes riel and dollars in the same
# column and every total computed from it is wrong.
CONDITIONAL_FIELDS = {"currency": "price"}

# Not asked about. `unit` is descriptive, and `price_basis` is a binary the
# confirmation screen can toggle far more cheaply than a spoken follow-up.
OPTIONAL_FIELDS = ("unit", "price_basis")

VALID_CURRENCIES = ("KHR", "USD")

# --- Currency inference ----------------------------------------------------
# Sellers rarely say the currency out loud, because in Cambodia the amount
# implies it: nobody sells a coffee for $4000, and nobody prices anything at
# 3 riel. Asking every time is tedious, so infer where the magnitude leaves
# no real doubt and ask only in the genuinely ambiguous middle.
CURRENCY_INFER = os.getenv("CURRENCY_INFER", "1") not in ("0", "false", "False")

# At or above this, treat a bare number as riel.
KHR_MIN_PRICE = float(os.getenv("KHR_MIN_PRICE", "1000"))
# At or below this, treat a bare number as dollars.
USD_MAX_PRICE = float(os.getenv("USD_MAX_PRICE", "99"))
VALID_PRICE_BASIS = ("unit", "total")

# Guard against a model that hallucinates a runaway list of products.
MAX_ITEMS = int(os.getenv("MAX_ITEMS", "10"))

# Cap on catalogue names fed into the transcription prompt. Every name is an
# input token on every recording.
MAX_CATALOG_HINTS = int(os.getenv("MAX_CATALOG_HINTS", "40"))

# Similarity above which a transcribed name is treated as a known product.
# Raise it if wrong products start being matched; lower it if obvious
# near-misses are being missed. catalog.py raises it further for short names.
CATALOG_MATCH_THRESHOLD = float(os.getenv("CATALOG_MATCH_THRESHOLD", "0.72"))


# --- Clarification loop ----------------------------------------------------
# Hard cap. After this many follow-ups we hand off to manual entry rather
# than looping. The one-time confirmation step is NOT counted here.
MAX_FOLLOWUP_ATTEMPTS = int(os.getenv("MAX_FOLLOWUP_ATTEMPTS", "3"))


# --- Network ---------------------------------------------------------------
# Free tier: 429 (rate limit) and 503 (overloaded) are both expected.
# Bounded backoff only — an unbounded retry loop is where worst-case latency hides.
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))

# Deterministic output. Without this the SDK default sampling makes the same
# audio produce different records on different runs, which means an evaluation
# set measures noise instead of measuring the prompt.
TEMPERATURE = float(os.getenv("TEMPERATURE", "0"))
RETRY_BASE_DELAY_S = float(os.getenv("RETRY_BASE_DELAY_S", "0.75"))


def validate() -> None:
    """Fail loudly at startup rather than on the first seller's request."""
    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Copy .env.example to .env and fill it in. "
            "Never commit .env."
        )
    if ASR_BACKEND not in ("prompted", "transcribe"):
        raise RuntimeError(
            f"ASR_BACKEND must be 'prompted' or 'transcribe', got {ASR_BACKEND!r}"
        )


@lru_cache(maxsize=1)
def get_client():
    """Single shared Gemini client.

    Built once and cached. Constructing a client per request costs a fresh
    connection setup on every sale, which is pure latency for no benefit.
    """
    from google import genai

    validate()
    return genai.Client(api_key=GEMINI_API_KEY)


def generation_config():
    """Shared generation settings for every Gemini call."""
    from google.genai import types

    return types.GenerateContentConfig(temperature=TEMPERATURE)


def call_with_retry(fn, *, what: str):
    """Run a Gemini call with bounded exponential backoff.

    Lives here rather than in a new module so we don't add a top-level file
    just to hold six lines shared by transcriber.py and extractor.py.
    """
    import time

    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            return fn()
        except Exception as exc:  # SDK raises transport-specific types
            last_error = exc
            message = str(exc)
            retryable = "429" in message or "503" in message or "RESOURCE_EXHAUSTED" in message
            if not retryable or attempt == MAX_RETRIES:
                break
            time.sleep(RETRY_BASE_DELAY_S * (2**attempt))

    raise RuntimeError(f"{what} failed after {MAX_RETRIES + 1} attempts: {last_error}")