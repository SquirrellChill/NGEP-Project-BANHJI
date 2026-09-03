"""LangGraph orchestration: transcriber -> extractor -> followup.

Replaces pipeline.py's manual if/else _resolve chain with an explicit graph.
No checkpointer, no persisted thread_id — the service stays stateless. Each
FastAPI call builds a fresh input dict (from the request body, exactly like
before), invokes the graph once start-to-finish, and returns state["result"].
The Node backend still holds the session between calls.

Two entry points share the same tail:
  - "audio"    -> transcribe -> extract -----v
  - "followup" -> apply_answer --------------> infer_currency -> route -> END
"""

from typing import Optional, TypedDict

from langgraph.graph import END, START, StateGraph

import extractor
import followup
import transcriber

try:
    import catalog
except ImportError:  # optional — reconciliation is a no-op without it
    catalog = None

try:
    import to_db
except ImportError:  # optional — graph runs fine without the DB mapper
    to_db = None

NEEDS_FOLLOWUP = "needs_followup"
NEEDS_CONFIRMATION = "needs_confirmation"
MANUAL_ENTRY = "manual_entry"


class SaleState(TypedDict, total=False):
    entry: str  # "audio" | "followup" — picks the start branch
    audio_bytes: Optional[bytes]
    mime_type: str
    catalog: list

    transcript: str
    record: dict
    attempts: int
    default_method: Optional[str]

    # only used when entry == "followup"
    answer_text: str
    asked_index: int
    asked_field: str
    asked_question: str

    currency_notes: list
    catalog_matches: list
    result: dict


# --- nodes -------------------------------------------------------------

def transcribe_node(state: SaleState) -> dict:
    transcript = transcriber.transcribe(
        state["audio_bytes"],
        state.get("mime_type", "audio/ogg"),
        state.get("catalog") or [],
    )
    return {"transcript": transcript}


def extract_node(state: SaleState) -> dict:
    record = extractor.extract(state["transcript"])
    return {"record": record, "attempts": 0}


def apply_answer_node(state: SaleState) -> dict:
    attempts = int(state.get("attempts", 0)) + 1
    record = state.get("record") or extractor.empty_record()

    value = extractor.extract_field_answer(
        state["asked_field"], state.get("asked_question", ""), state["answer_text"]
    )
    updated = followup.apply_answer(record, int(state["asked_index"]), state["asked_field"], value)

    combined = f'{state.get("transcript", "").strip()} {state["answer_text"].strip()}'.strip()
    return {"record": updated, "attempts": attempts, "transcript": combined}


def infer_currency_node(state: SaleState) -> dict:
    record, notes = extractor.infer_currency(state["record"], state.get("default_method"))
    return {"record": record, "currency_notes": notes}


def reconcile_node(state: SaleState) -> dict:
    """Snap spoken item names onto the seller's known catalog.

    This is the actual fix for Khmer spelling errors — the catalog hint in
    the transcription prompt only biases the ASR, it doesn't guarantee a
    match. This is the pass that catches what the ASR still got wrong
    (e.g. តែ ប៉ិទង -> តែបៃតង), using fuzzy matching against products the
    seller has actually sold before.
    """
    if catalog is None or not state.get("catalog"):
        return {}
    result = catalog.reconcile(state["record"], state["catalog"])
    return {"record": result["record"], "catalog_matches": result["matches"]}


def confirm_node(state: SaleState) -> dict:
    result = _base_result(NEEDS_CONFIRMATION, state)
    if to_db is not None:
        result["db"] = to_db.to_sale_payload(state["record"])
    return {"result": result}


def manual_entry_node(state: SaleState) -> dict:
    return {"result": _base_result(MANUAL_ENTRY, state)}


def ask_followup_node(state: SaleState) -> dict:
    index, field, question = followup.next_question(state["record"])
    result = _base_result(NEEDS_FOLLOWUP, state)
    result["question"] = question
    result["asked_field"] = field
    result["asked_index"] = index
    return {"result": result}


def _base_result(status: str, state: SaleState) -> dict:
    record = state["record"]
    return {
        "status": status,
        "transcript": state.get("transcript", ""),
        "record": record,
        "attempts": state.get("attempts", 0),
        "item_count": len(record.get("items") or []),
        "missing_slots": [
            {"index": i, "field": f} for i, f in followup.missing_slots(record)
        ],
        "question": None,
        "asked_field": None,
        "asked_index": None,
        "db": None,
        "currency_notes": state.get("currency_notes", []),
        "catalog_matches": state.get("catalog_matches", []),
    }


# --- routing -------------------------------------------------------------

def route_entry(state: SaleState) -> str:
    if state["entry"] == "audio":
        return "transcribe"
    if state["entry"] == "followup":
        return "apply_answer"
    return "reconcile"  # entry == "resolve" — record is already built


def route_after_currency(state: SaleState) -> str:
    if followup.is_complete(state["record"]):
        return "confirm"
    if followup.attempts_exhausted(state["attempts"]):
        return "manual_entry"
    return "ask_followup"


# --- graph -----------------------------------------------------------------

builder = StateGraph(SaleState)
builder.add_node("transcribe", transcribe_node)
builder.add_node("extract", extract_node)
builder.add_node("apply_answer", apply_answer_node)
builder.add_node("infer_currency", infer_currency_node)
builder.add_node("reconcile", reconcile_node)
builder.add_node("confirm", confirm_node)
builder.add_node("manual_entry", manual_entry_node)
builder.add_node("ask_followup", ask_followup_node)

builder.add_conditional_edges(
    START,
    route_entry,
    {"transcribe": "transcribe", "apply_answer": "apply_answer", "reconcile": "reconcile"},
)
builder.add_edge("transcribe", "extract")
builder.add_edge("extract", "reconcile")
builder.add_edge("apply_answer", "reconcile")
builder.add_edge("reconcile", "infer_currency")
builder.add_conditional_edges(
    "infer_currency",
    route_after_currency,
    {"confirm": "confirm", "manual_entry": "manual_entry", "ask_followup": "ask_followup"},
)
builder.add_edge("confirm", END)
builder.add_edge("manual_entry", END)
builder.add_edge("ask_followup", END)

sale_graph = builder.compile()


# --- thin wrappers matching pipeline.py's old public API -------------------
# Keep main.py's call sites unchanged — swap the import, not the call shape.

def process_audio(audio_bytes: bytes, mime_type: str = "audio/ogg", catalog: list | None = None) -> dict:
    state = sale_graph.invoke({
        "entry": "audio",
        "audio_bytes": audio_bytes,
        "mime_type": mime_type,
        "catalog": catalog or [],
    })
    return state["result"]


def resolve(transcript: str, record: dict, attempts: int, default_method: str | None = None) -> dict:
    """Re-resolve an already-built record (no ASR, no extraction).

    Matches the old pipeline._resolve(transcript, record, attempts) signature,
    for callers that already have a record — e.g. the /test/text and
    /test/record dev endpoints in main.py.
    """
    state = sale_graph.invoke({
        "entry": "resolve",
        "transcript": transcript,
        "record": record,
        "attempts": attempts,
        "default_method": default_method,
    })
    return state["result"]


def process_followup(
    transcript: str,
    record: dict,
    answer_text: str,
    attempts: int,
    asked_index: int,
    asked_field: str,
    asked_question: str = "",
    catalog: list | None = None,
) -> dict:
    state = sale_graph.invoke({
        "entry": "followup",
        "transcript": transcript,
        "record": record,
        "catalog": catalog or [],
        "answer_text": answer_text,
        "attempts": attempts,
        "asked_index": asked_index,
        "asked_field": asked_field,
        "asked_question": asked_question,
    })
    return state["result"]