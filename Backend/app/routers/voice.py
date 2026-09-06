"""Voice endpoints. Speech in, a draft sales record out.

Nothing here writes to the database. The pipeline returns a draft, the seller
confirms it on screen, and the app posts the confirmed version to
/transactions. Saving straight from a transcript would mean storing figures
nobody checked.

Every route is scoped to the signed-in seller. The voice service used to be
unauthenticated when it ran as its own process; folding it into this app means
it now sits behind the same guard as everything else.
"""

import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repositories import transaction_repository as tx_repo
from app.services import voice_pipeline
from app.services.transcriber import transcribe as transcribe_audio

router = APIRouter(prefix="/voice", tags=["voice"])

# Anything past this is a recording that went wrong — a stuck button, a
# background capture. Rejecting early beats paying to transcribe it.
MAX_AUDIO_BYTES = 10 * 1024 * 1024


class FollowupRequest(BaseModel):
    """Continues the clarification loop.

    The client echoes back the slot it was asked about so the answer lands in
    the right line item — a two-product sale has more than one gap to fill.
    """

    transcript: str
    record: dict
    answer_text: str = Field(min_length=1)
    attempts: int = 0
    asked_index: int = 0
    asked_field: str = "item"
    asked_question: str = ""


class ResolveRequest(BaseModel):
    """Re-checks an already-built record without any new speech.

    Used when the record was changed directly rather than produced by a
    fresh transcription — a manual correction to a field mid-conversation,
    or a newly-recorded item merged into one the seller already confirmed —
    and needs the same completeness/currency/catalogue checks as any other
    path before the client can trust its status.
    """

    transcript: str
    record: dict
    attempts: int = 0
    default_method: Optional[str] = None
    catalog_names: list[str] = []


@router.post("/sale", status_code=status.HTTP_200_OK)
async def transcribe_sale(
    audio: UploadFile = File(...),
    mime_type: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """A seller has spoken a sale. Returns a draft record and what to do next.

    The product-name catalogue is read from this seller's own history rather
    than accepted from the client. Biasing the speech model toward names it
    has seen before is the biggest single lever on Khmer product-name
    accuracy, and building it server-side means it can't be spoofed and the
    app doesn't have to fetch it first.
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty audio upload.")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            "That recording is too long. Record the sale in shorter parts.",
        )

    resolved_mime = mime_type or audio.content_type or "audio/webm"
    catalog = await run_in_threadpool(_catalog_for, db, current_user.user_id)

    return await _run(
        voice_pipeline.process_audio, audio_bytes, resolved_mime, catalog
    )


@router.post("/followup", status_code=status.HTTP_200_OK)
async def answer_followup(
    payload: FollowupRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """The seller TYPED an answer to the clarification question. Continue the loop."""
    if not payload.answer_text.strip():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty follow-up answer.")

    return await _run(
        voice_pipeline.process_followup,
        payload.transcript,
        payload.record,
        payload.answer_text,
        payload.attempts,
        payload.asked_index,
        payload.asked_field,
        payload.asked_question,
    )


@router.post("/followup-audio", status_code=status.HTTP_200_OK)
async def answer_followup_audio(
    audio: UploadFile = File(...),
    transcript: str = Form(...),
    record: str = Form(...),  # JSON-encoded dict — multipart can't carry a
                               # nested object directly, only flat form fields
    attempts: int = Form(0),
    asked_index: int = Form(0),
    asked_field: str = Form("item"),
    asked_question: str = Form(""),
    mime_type: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """The seller SPOKE their answer to the clarification question.

    Same clarification loop as /followup — the only difference is the
    answer arrives as audio instead of typed text. We transcribe it first,
    then hand it to the exact same voice_pipeline.process_followup() call
    that the typed path uses, so the merge/currency/routing logic never
    has to know or care which input method the seller chose.
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty audio upload.")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            "That recording is too long. Record the sale in shorter parts.",
        )

    try:
        record_dict = json.loads(record)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "`record` must be valid JSON."
        ) from exc

    resolved_mime = mime_type or audio.content_type or "audio/webm"
    # Reuse this seller's catalogue for the follow-up transcription too --
    # a spoken price/quantity answer rarely needs it, but a spoken item-name
    # correction (e.g. answering an "item" follow-up) benefits the same way
    # the original recording did.
    catalog = await run_in_threadpool(_catalog_for, db, current_user.user_id)

    answer_text = await run_in_threadpool(
        transcribe_audio, audio_bytes, resolved_mime, catalog
    )
    if not answer_text.strip():
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Couldn't hear a clear answer in that recording. Please try again.",
        )

    return await _run(
        voice_pipeline.process_followup,
        transcript,
        record_dict,
        answer_text,
        attempts,
        asked_index,
        asked_field,
        asked_question,
    )


@router.post("/resolve", status_code=status.HTTP_200_OK)
async def resolve_sale(
    payload: ResolveRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Re-checks an already-built record — no ASR, no extraction.

    Two callers on the frontend need this: a direct correction to a field
    mid-conversation (the quick-edit pencil), and merging a freshly-recorded
    item into a record the seller already has (adding another item). Both
    hand back a record that was changed without going through transcription,
    and need the same completeness/currency/catalogue checks as any other
    path before the client can trust the returned status.
    """
    return await _run(
        voice_pipeline.resolve,
        payload.transcript,
        payload.record,
        payload.attempts,
        payload.default_method,
        payload.catalog_names,
    )


@router.get("/health")
def voice_health(current_user: User = Depends(get_current_user)) -> dict:
    """Which models are wired up. Useful when a transcript looks wrong and
    you need to know whether the ASR backend changed under you."""
    return {
        "asr_backend": settings.ASR_BACKEND,
        "asr_model": (
            settings.ASR_PROMPTED_MODEL
            if settings.ASR_BACKEND == "prompted"
            else settings.ASR_TRANSCRIBE_MODEL
        ),
        "extraction_model": settings.EXTRACTION_MODEL,
        "temperature": settings.TEMPERATURE,
    }


async def _run(func, *args) -> dict:
    """Run a pipeline call off the event loop and map failures to HTTP.

    The Gemini SDK is synchronous. Calling it inside `async def` would block
    the loop and serialise every request in the whole app, including auth.
    """
    try:
        return await run_in_threadpool(func, *args)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except RuntimeError as exc:
        # Upstream ASR or extraction failure after retries. 502 rather than
        # 500 so the app shows manual entry instead of retrying blindly.
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc


def _catalog_for(db: Session, user_id: int) -> list[str]:
    """Distinct product names from this seller's recent sales."""
    names: list[str] = []
    seen: set[str] = set()

    for sale in tx_repo.list_sales(db, user_id, limit=40):
        for item in sale.items or []:
            name = (item.description or "").strip()
            key = name.casefold()
            if name and key not in seen:
                seen.add(key)
                names.append(name)

    return names[: settings.MAX_CATALOG_HINTS]