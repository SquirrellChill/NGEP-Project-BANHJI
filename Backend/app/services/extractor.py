"""Text -> structured record. One job.

Output contract. One sale, one date, one or more line items:
    {"items": [{"item": str|None, "quantity": int|None, "unit": str|None,
                "price": num|None, "currency": "KHR"|"USD"|None,
                "price_basis": "unit"|"total"|None}, ...],
     "date": str|None}

`items` is never empty — an unparseable transcript yields one blank line so the
clarification loop always has a slot to ask about.

Note: `extract()` always returns a record per this contract, even for a
transcript that's too short to mean anything. Deciding whether a transcript
is worth extracting at all (vs. asking the seller to re-record) is a
*routing* decision, not extraction's job -- see `is_unclear()` below, called
from voice_pipeline.py before extract() runs.
"""

import json
import re

from app.core.config import (
    settings,
    LINE_FIELDS,
    VALID_PAYMENT_METHODS,
    VALID_PRICE_BASIS,
    call_with_retry,
    generation_config,
    get_client,
)
from app.services import prompts

_FENCE = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$", re.IGNORECASE)
_NUMBER = re.compile(r"-?\d+(?:[.,]\d+)?")

# Khmer numerals ០-៩, so a transcript that already used digits doesn't need a
# model call to become an int.
_KHMER_DIGITS = str.maketrans("០១២៣៤៥៦៧៨៩", "0123456789")

_KHR_WORDS = ("រៀល", "៛", "riel", "khr")
_USD_WORDS = ("ដុល្លារ", "$", "dollar", "usd")

# Below this many stripped characters, a transcript is more likely a mic
# hiccup or background noise than an actual attempt to describe a sale --
# "ok", a cough transcribed as one syllable, silence that leaked a filler
# word. Asking the model to extract fields from it wastes a call and, worse,
# walks the seller through a full clarification loop ("what did you sell?")
# for input that was never really an answer to begin with. Better to say
# "didn't catch that, try again" up front.
MIN_TRANSCRIPT_CHARS = 3


def is_unclear(transcript: str) -> bool:
    """True if a transcript is too short/empty to be worth extracting.

    Deliberately conservative and deterministic -- no model call, no
    language-specific parsing, just a length check. A real but short sale
    ("ដុំ ១") is rare enough that erring toward "let extraction try" above
    this threshold is the safer default; below it, silence or noise is the
    overwhelmingly more likely explanation.
    """
    return not transcript or len(transcript.strip()) < MIN_TRANSCRIPT_CHARS


def extract(transcript: str) -> dict:
    """Pull one sale, with all its line items, out of a transcript."""
    if not transcript or not transcript.strip():
        return empty_record()

    client = get_client()
    prompt = prompts.EXTRACTION_PROMPT.format(transcript=transcript.strip())

    def call():
        return client.models.generate_content(
            model=settings.EXTRACTION_MODEL,
            contents=prompt,
            config=generation_config(),
        )

    response = call_with_retry(call, what="Extraction")
    return normalize(parse_json(getattr(response, "text", "") or ""))


def extract_field_answer(field: str, question: str, answer: str):
    """Parse a single value out of a follow-up answer.

    Fast paths first — digits for numbers, keyword match for currency. Only
    spoken number words and free-text product names reach the model.
    """
    answer = (answer or "").strip()
    if not answer:
        return None

    if field == "currency":
        direct = _to_currency(answer)
        if direct is not None:
            return direct
    elif field in ("quantity", "price"):
        direct = _to_number(answer, as_int=(field == "quantity"))
        if direct is not None:
            return direct

    client = get_client()
    prompt = prompts.FIELD_ANSWER_PROMPT.format(
        question=question, answer=answer, field=field
    )

    def call():
        return client.models.generate_content(
            model=settings.EXTRACTION_MODEL,
            contents=prompt,
            config=generation_config(),
        )

    response = call_with_retry(call, what="Follow-up parsing")
    value = parse_json(getattr(response, "text", "") or "").get("value")

    if field == "quantity":
        return _to_number(value, as_int=True)
    if field == "price":
        return _to_number(value, as_int=False)
    if field == "currency":
        return _to_currency(value)
    return _clean_text(value)


def empty_line() -> dict:
    return {field: None for field in LINE_FIELDS}


def empty_record() -> dict:
    return {"items": [empty_line()], "date": None, "payment_method": None}


def parse_json(raw: str) -> dict:
    """Tolerate fences and stray prose around the JSON object."""
    text = _FENCE.sub("", raw.strip())
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start == -1 or end <= start:
            return {}
        try:
            parsed = json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            return {}

    return parsed if isinstance(parsed, dict) else {}


def normalize(parsed: dict) -> dict:
    """Coerce to the contract. Anything unusable becomes None, never a guess."""
    raw_items = parsed.get("items")
    if not isinstance(raw_items, list):
        raw_items = []

    items = []
    for entry in raw_items[: settings.MAX_ITEMS]:
        if not isinstance(entry, dict):
            continue
        line = {
            "item": _clean_text(entry.get("item")),
            "quantity": _to_number(entry.get("quantity"), as_int=True),
            "unit": _clean_text(entry.get("unit")),
            "price": _to_number(entry.get("price"), as_int=False),
            "currency": _to_currency(entry.get("currency")),
            "price_basis": _to_enum(entry.get("price_basis"), VALID_PRICE_BASIS),
        }
        if any(v is not None for v in line.values()):
            items.append(line)

    if not items:
        items = [empty_line()]

    return {
        "items": items,
        "date": _clean_text(parsed.get("date")),
        "payment_method": _to_enum(
            parsed.get("payment_method"), VALID_PAYMENT_METHODS
        ),
    }


def _clean_text(value):
    if not isinstance(value, str):
        return None
    stripped = value.strip()
    if not stripped or stripped.lower() == "null":
        return None
    return stripped


def _to_enum(value, allowed):
    text = _clean_text(value)
    if text is None:
        return None
    lowered = text.lower()
    for option in allowed:
        if lowered == option.lower():
            return option
    return None


def _to_currency(value):
    """KHR or USD, or None. Never inferred from the size of the number."""
    text = _clean_text(value)
    if text is None:
        return None
    lowered = text.lower()
    if any(word in lowered for word in _KHR_WORDS):
        return "KHR"
    if any(word in lowered for word in _USD_WORDS):
        return "USD"
    return None


def _to_number(value, *, as_int: bool):
    """Digits only. Anything genuinely absent stays None rather than guessed."""
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value) if as_int else value

    if isinstance(value, str):
        match = _NUMBER.search(value.translate(_KHMER_DIGITS).replace(",", ""))
        if not match:
            return None
        try:
            number = float(match.group())
        except ValueError:
            return None
        if as_int:
            return int(number)
        return int(number) if number.is_integer() else number

    return None


def infer_currency(record: dict, default_method: str | None = None):
    """Fill in currencies the seller didn't say out loud.

    Two rules, in order. Neither overwrites a stated currency.

    1. If exactly one currency was stated anywhere in the sale, apply it to
       the lines that have none. A seller quoting one product in riel is
       almost never quoting the next in dollars without saying so.
    2. Otherwise infer from magnitude, but only outside the ambiguous middle.
       500 could plausibly be 500 riel, so that still gets asked about.

    Returns (record, notes). Every inference is reported so the confirmation
    screen can show it rather than the number changing meaning silently.
    """
    items = [dict(line) for line in record.get("items") or []]
    notes = []
    method = record.get("payment_method")

    if method is None:
        method = default_method or settings.DEFAULT_PAYMENT_METHOD
        source = "this seller's usual method" if default_method else "the default"
        notes.append({
            "index": None, "basis": "default", "currency": None,
            "note": f"payment method not spoken, assumed {method} ({source}). "
                    "Confirm before saving.",
        })
    elif method == "credit":
        notes.append({
            "index": None, "basis": "credit", "currency": None,
            "note": "recorded as credit — the money has not been received, so "
                    "it should not count toward cash or bank income yet.",
        })

    def out(lines):
        return {"items": lines, "date": record.get("date"),
                "payment_method": method}

    if not settings.CURRENCY_INFER:
        return out(items), notes

    stated = {line.get("currency") for line in items if line.get("currency")}
    sale_currency = stated.pop() if len(stated) == 1 else None

    for index, line in enumerate(items):
        if line.get("currency") is not None:
            continue
        price = line.get("price")
        if price is None:
            continue

        if sale_currency:
            items[index]["currency"] = sale_currency
            notes.append({
                "index": index, "currency": sale_currency, "basis": "sale",
                "note": f"item {index + 1}: currency not spoken, matched the "
                        f"rest of this sale ({sale_currency}).",
            })
            continue

        inferred = _currency_from_magnitude(price)
        if inferred is None:
            continue  # ambiguous — leave it for the follow-up to ask
        items[index]["currency"] = inferred
        notes.append({
            "index": index, "currency": inferred, "basis": "magnitude",
            "note": f"item {index + 1}: currency not spoken, read {price:g} as "
                    f"{inferred} from the amount. Confirm before saving.",
        })

    return out(items), notes


def _currency_from_magnitude(price):
    if price >= settings.KHR_MIN_PRICE:
        return "KHR"
    if price <= settings.USD_MAX_PRICE:
        return "USD"
    return None