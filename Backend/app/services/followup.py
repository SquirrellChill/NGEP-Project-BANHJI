"""Human-in-the-loop clarification loop (slot-filling). One job.

Deliberately scoped: one bounded loop over the required fields of each line
item. Not an agent, not a graph, no tool routing.

No model calls in this file. Detecting a gap is a dict check and the Khmer
questions are templates, so identifying and phrasing the next question costs
no network round-trip.
"""

from app.core.config import settings, CONDITIONAL_FIELDS, REQUIRED_FIELDS
from app.services import prompts


def missing_slots(record: dict) -> list:
    """Every unfilled required field, as (line_index, field), in ask order.

    Ordered line by line so a two-item sale is clarified one product at a time
    rather than jumping between them.
    """
    slots = []
    for index, line in enumerate(record.get("items") or []):
        for field in REQUIRED_FIELDS:
            if _is_empty(line.get(field)):
                slots.append((index, field))
        # Conditional gaps: currency only matters once a price exists.
        for field, depends_on in CONDITIONAL_FIELDS.items():
            if _is_empty(line.get(field)) and not _is_empty(line.get(depends_on)):
                slots.append((index, field))
    return slots


def is_complete(record: dict) -> bool:
    return not missing_slots(record)


def next_question(record: dict):
    """The single next thing to ask, or None if nothing is missing.

    Returns (line_index, field, question_in_khmer). One field of one product at
    a time -- never ask about two gaps in the same question.
    """
    slots = missing_slots(record)
    if not slots:
        return None

    index, field = slots[0]
    line = record["items"][index]
    position = index + 1

    if field == "item":
        question = prompts.FOLLOWUP_QUESTIONS["item"].format(position=position)
    elif line.get("item"):
        question = prompts.FOLLOWUP_QUESTIONS[field].format(item=line["item"])
    else:
        # Product name still unknown, so refer to it by position instead.
        question = prompts.FOLLOWUP_QUESTIONS_UNNAMED[field].format(position=position)

    return index, field, question


def apply_answer(record: dict, index: int, field: str, value) -> dict:
    """Write one parsed answer into one slot.

    Targeted rather than re-extracting the whole transcript: with several line
    items, a re-extraction can re-segment the products differently and scramble
    values the seller already confirmed. Only ever fills a gap, never
    overwrites an existing value.
    """
    updated = {
        "items": [dict(line) for line in record.get("items") or []],
        "date": record.get("date"),
        "payment_method": record.get("payment_method"),
    }

    if value is None:
        return updated
    if not 0 <= index < len(updated["items"]):
        return updated
    if not _is_empty(updated["items"][index].get(field)):
        return updated

    updated["items"][index][field] = value
    return updated


def apply_updates(record: dict, updates: list) -> dict:
    """Write several parsed updates into the record at once.

    Unlike apply_answer, this DOES overwrite an existing value -- it backs
    extract_followup_updates(), which is deliberately also used to apply
    corrections (e.g. a misheard item name), not only to fill blank gaps.
    Skipping the "already filled" check here is what makes the quick-edit
    and free-form-correction cases actually work, as opposed to silently
    doing nothing the way a fill-only write would.

    Each entry in `updates` is expected already validated (index bounds
    checked, field name checked, value type-coerced) by
    extract_followup_updates -- this function trusts that and just writes,
    but re-checks bounds defensively in case a caller ever skips that step.
    """
    updated = {
        "items": [dict(line) for line in record.get("items") or []],
        "date": record.get("date"),
        "payment_method": record.get("payment_method"),
    }

    for update in updates or []:
        index = update.get("index")
        field = update.get("field")
        value = update.get("value")

        if value is None:
            continue
        if not isinstance(index, int) or not (0 <= index < len(updated["items"])):
            continue

        updated["items"][index][field] = value

    return updated


def attempts_exhausted(attempts: int) -> bool:
    """True once we should stop asking and hand off to manual entry."""
    return attempts >= settings.MAX_FOLLOWUP_ATTEMPTS


def _is_empty(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return not value.strip() or value.strip().lower() == "null"
    return False