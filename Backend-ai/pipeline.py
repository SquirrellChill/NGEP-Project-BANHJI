# # """Orchestration: transcriber -> extractor -> followup. One job.

# # Straight-line flow, no branching framework. Loop state (transcript, partial
# # record, attempt count, and which slot was last asked about) is returned to the
# # caller and handed back on the next call, so this service stays stateless — the
# # Node backend holds the session. No session store, no expiry, no shared state
# # between workers.
# # """

# # import extractor
# # import followup
# # import transcriber

# # # Status values returned to the Node backend.
# # NEEDS_FOLLOWUP = "needs_followup"          # ask the question, come back
# # NEEDS_CONFIRMATION = "needs_confirmation"  # complete, show the confirm screen
# # MANUAL_ENTRY = "manual_entry"              # stopped asking, let them type it in


# # def process_audio(
# #     audio_bytes: bytes,
# #     mime_type: str = "audio/ogg",
# #     catalog: list | None = None,
# # ) -> dict:
# #     """First pass: a seller has just spoken a sale.

# #     `catalog` is this seller's previously recorded product names. Passing it
# #     biases the ASR toward names it has seen before, which is the single biggest
# #     lever on product-name accuracy.
# #     """
# #     transcript = transcriber.transcribe(audio_bytes, mime_type, catalog)
# #     record = extractor.extract(transcript)
# #     return _resolve(transcript, record, attempts=0)


# # def process_followup(
# #     transcript: str,
# #     record: dict,
# #     answer_text: str,
# #     attempts: int,
# #     asked_index: int,
# #     asked_field: str,
# #     asked_question: str = "",
# # ) -> dict:
# #     """Continue the loop with the seller's answer to the last question.

# #     The caller echoes back which slot was asked about, so the answer lands in
# #     exactly that slot.
# #     """
# #     attempts = int(attempts) + 1
# #     record = record or extractor.empty_record()

# #     value = extractor.extract_field_answer(asked_field, asked_question, answer_text)
# #     updated = followup.apply_answer(record, int(asked_index), asked_field, value)

# #     combined = f"{transcript.strip()} {answer_text.strip()}".strip()
# #     return _resolve(combined, updated, attempts)


# # def _resolve(transcript: str, record: dict, attempts: int) -> dict:
# #     """Decide what the caller should do next."""
# #     if followup.is_complete(record):
# #         # Confirmation is a separate one-time step, not part of this loop.
# #         return _result(NEEDS_CONFIRMATION, transcript, record, attempts)

# #     if followup.attempts_exhausted(attempts):
# #         return _result(MANUAL_ENTRY, transcript, record, attempts)

# #     index, field, question = followup.next_question(record)
# #     result = _result(NEEDS_FOLLOWUP, transcript, record, attempts)
# #     result["question"] = question
# #     result["asked_field"] = field
# #     result["asked_index"] = index
# #     return result


# # def _result(status: str, transcript: str, record: dict, attempts: int) -> dict:
# #     return {
# #         "status": status,
# #         "transcript": transcript,
# #         "record": record,
# #         "attempts": attempts,
# #         "item_count": len(record.get("items") or []),
# #         "missing_slots": [
# #             {"index": i, "field": f} for i, f in followup.missing_slots(record)
# #         ],
# #         "question": None,
# #         "asked_field": None,
# #         "asked_index": None,
# #     }

# """Orchestration: transcriber -> extractor -> followup. One job.

# Straight-line flow, no branching framework. Loop state (transcript, partial
# record, attempt count, and which slot was last asked about) is returned to the
# caller and handed back on the next call, so this service stays stateless — the
# Node backend holds the session. No session store, no expiry, no shared state
# between workers.
# """

# import extractor
# import followup
# import transcriber

# try:
#     import to_db
# except ImportError:  # optional — the pipeline runs fine without the DB mapper
#     to_db = None

# # Status values returned to the Node backend.
# NEEDS_FOLLOWUP = "needs_followup"          # ask the question, come back
# NEEDS_CONFIRMATION = "needs_confirmation"  # complete, show the confirm screen
# MANUAL_ENTRY = "manual_entry"              # stopped asking, let them type it in


# def process_audio(
#     audio_bytes: bytes,
#     mime_type: str = "audio/ogg",
#     catalog: list | None = None,
# ) -> dict:
#     """First pass: a seller has just spoken a sale.

#     `catalog` is this seller's previously recorded product names. Passing it
#     biases the ASR toward names it has seen before, which is the single biggest
#     lever on product-name accuracy.
#     """
#     transcript = transcriber.transcribe(audio_bytes, mime_type, catalog)
#     record = extractor.extract(transcript)
#     return _resolve(transcript, record, attempts=0)


# def process_followup(
#     transcript: str,
#     record: dict,
#     answer_text: str,
#     attempts: int,
#     asked_index: int,
#     asked_field: str,
#     asked_question: str = "",
# ) -> dict:
#     """Continue the loop with the seller's answer to the last question.

#     The caller echoes back which slot was asked about, so the answer lands in
#     exactly that slot.
#     """
#     attempts = int(attempts) + 1
#     record = record or extractor.empty_record()

#     value = extractor.extract_field_answer(asked_field, asked_question, answer_text)
#     updated = followup.apply_answer(record, int(asked_index), asked_field, value)

#     combined = f"{transcript.strip()} {answer_text.strip()}".strip()
#     return _resolve(combined, updated, attempts)


# def _resolve(transcript: str, record: dict, attempts: int) -> dict:
#     """Decide what the caller should do next."""
#     if followup.is_complete(record):
#         # Confirmation is a separate one-time step, not part of this loop.
#         result = _result(NEEDS_CONFIRMATION, transcript, record, attempts)
#         # Attach the DB-shaped rows so Node doesn't recompute the arithmetic.
#         # Skipped when to_db.py isn't present; nothing else depends on it.
#         if to_db is not None:
#             result["db"] = to_db.to_sale_payload(record)
#         return result

#     if followup.attempts_exhausted(attempts):
#         return _result(MANUAL_ENTRY, transcript, record, attempts)

#     index, field, question = followup.next_question(record)
#     result = _result(NEEDS_FOLLOWUP, transcript, record, attempts)
#     result["question"] = question
#     result["asked_field"] = field
#     result["asked_index"] = index
#     return result


# def _result(status: str, transcript: str, record: dict, attempts: int) -> dict:
#     return {
#         "status": status,
#         "transcript": transcript,
#         "record": record,
#         "attempts": attempts,
#         "item_count": len(record.get("items") or []),
#         "missing_slots": [
#             {"index": i, "field": f} for i, f in followup.missing_slots(record)
#         ],
#         "question": None,
#         "asked_field": None,
#         "asked_index": None,
#         "db": None,
#     }


"""Orchestration: transcriber -> extractor -> followup. One job.

Straight-line flow, no branching framework. Loop state (transcript, partial
record, attempt count, and which slot was last asked about) is returned to the
caller and handed back on the next call, so this service stays stateless — the
Node backend holds the session. No session store, no expiry, no shared state
between workers.
"""

import extractor
import followup
import transcriber

try:
    import to_db
except ImportError:  # optional — the pipeline runs fine without the DB mapper
    to_db = None

# Status values returned to the Node backend.
NEEDS_FOLLOWUP = "needs_followup"          # ask the question, come back
NEEDS_CONFIRMATION = "needs_confirmation"  # complete, show the confirm screen
MANUAL_ENTRY = "manual_entry"              # stopped asking, let them type it in


def process_audio(
    audio_bytes: bytes,
    mime_type: str = "audio/ogg",
    catalog: list | None = None,
) -> dict:
    """First pass: a seller has just spoken a sale.

    `catalog` is this seller's previously recorded product names. Passing it
    biases the ASR toward names it has seen before, which is the single biggest
    lever on product-name accuracy.
    """
    transcript = transcriber.transcribe(audio_bytes, mime_type, catalog)
    record = extractor.extract(transcript)
    return _resolve(transcript, record, attempts=0)


def process_followup(
    transcript: str,
    record: dict,
    answer_text: str,
    attempts: int,
    asked_index: int,
    asked_field: str,
    asked_question: str = "",
) -> dict:
    """Continue the loop with the seller's answer to the last question.

    The caller echoes back which slot was asked about, so the answer lands in
    exactly that slot.
    """
    attempts = int(attempts) + 1
    record = record or extractor.empty_record()

    value = extractor.extract_field_answer(asked_field, asked_question, answer_text)
    updated = followup.apply_answer(record, int(asked_index), asked_field, value)

    combined = f"{transcript.strip()} {answer_text.strip()}".strip()
    return _resolve(combined, updated, attempts)


def _resolve(transcript: str, record: dict, attempts: int) -> dict:
    """Decide what the caller should do next."""
    # Fill unspoken currencies before checking for gaps, so the loop only asks
    # about the genuinely ambiguous ones.
    record, currency_notes = extractor.infer_currency(record)
    if followup.is_complete(record):
        # Confirmation is a separate one-time step, not part of this loop.
        result = _result(NEEDS_CONFIRMATION, transcript, record, attempts)
        result["currency_notes"] = currency_notes
        # Attach the DB-shaped rows so Node doesn't recompute the arithmetic.
        # Skipped when to_db.py isn't present; nothing else depends on it.
        if to_db is not None:
            result["db"] = to_db.to_sale_payload(record)
        return result

    if followup.attempts_exhausted(attempts):
        result = _result(MANUAL_ENTRY, transcript, record, attempts)
        result["currency_notes"] = currency_notes
        return result

    index, field, question = followup.next_question(record)
    result = _result(NEEDS_FOLLOWUP, transcript, record, attempts)
    result["currency_notes"] = currency_notes
    result["question"] = question
    result["asked_field"] = field
    result["asked_index"] = index
    return result


def _result(status: str, transcript: str, record: dict, attempts: int) -> dict:
    return {
        "status": status,
        "transcript": transcript,
        "record": record,
        "attempts": attempts,
        "item_count": len(record.get("items") or []),
        "missing_slots": [
            {"index": i, "field": f} for i, f in followup.missing_slots(record)
        ],
        "question": None,
        "asked_field": None,
        "asked_index": None,
        "db": None,
        "currency_notes": [],
    }