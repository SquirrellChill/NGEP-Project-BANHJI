# """FastAPI surface. Called by the Node/Express backend, never by the app directly.

# The Gemini SDK is synchronous. Calling it directly inside `async def` blocks the
# event loop and serializes every concurrent request, so every call goes through
# run_in_threadpool.
# """

# import json
# from contextlib import asynccontextmanager
# from typing import Optional

# from fastapi import FastAPI, File, Form, HTTPException, UploadFile
# from fastapi.concurrency import run_in_threadpool
# from pydantic import BaseModel

# import config
# import pipeline

# @asynccontextmanager
# async def lifespan(_: FastAPI):
#     # Fail at boot on a bad key or bad ASR_BACKEND, not on a seller's first sale.
#     config.validate()
#     config.get_client()  # warm the client so the first request isn't slower
#     yield


# app = FastAPI(title="KOTCHOMNOL AI backend", version="1.0.0", lifespan=lifespan)


# class FollowupRequest(BaseModel):
#     transcript: str
#     record: dict
#     answer_text: str
#     attempts: int = 0
#     # Echo these back from the previous response so the answer lands in the
#     # right line item. A two-product sale has more than one gap to fill.
#     asked_index: int = 0
#     asked_field: str = "item"
#     asked_question: str = ""


# @app.get("/health")
# def health() -> dict:
#     return {
#         "ok": True,
#         "asr_backend": config.ASR_BACKEND,
#         "asr_model": (
#             config.ASR_PROMPTED_MODEL
#             if config.ASR_BACKEND == "prompted"
#             else config.ASR_TRANSCRIBE_MODEL
#         ),
#         "extraction_model": config.EXTRACTION_MODEL,
#     }


# @app.post("/sale/voice")
# async def sale_voice(
#     audio: UploadFile = File(...),
#     mime_type: Optional[str] = Form(None),
#     catalog: Optional[str] = Form(None),
# ) -> dict:
#     """A seller has spoken a sale. Returns a record plus what to do next."""
#     audio_bytes = await audio.read()
#     if not audio_bytes:
#         raise HTTPException(status_code=400, detail="Empty audio upload.")

#     resolved_mime = mime_type or audio.content_type or "audio/ogg"

#     # Node sends the seller's known product names as a JSON array of strings.
#     names = []
#     if catalog:
#         try:
#             parsed = json.loads(catalog)
#             if isinstance(parsed, list):
#                 names = [str(n) for n in parsed]
#         except json.JSONDecodeError:
#             # Biasing is an optimisation, never a reason to reject a sale.
#             names = []

#     try:
#         return await run_in_threadpool(
#             pipeline.process_audio, audio_bytes, resolved_mime, names
#         )
#     except ValueError as exc:
#         raise HTTPException(status_code=400, detail=str(exc)) from exc
#     except RuntimeError as exc:
#         # Upstream ASR/extraction failure after retries. 502, not 500 — the
#         # Node backend should surface manual entry rather than retry blindly.
#         raise HTTPException(status_code=502, detail=str(exc)) from exc


# @app.post("/sale/followup")
# async def sale_followup(payload: FollowupRequest) -> dict:
#     """The seller answered the clarification question. Continue the loop."""
#     if not payload.answer_text.strip():
#         raise HTTPException(status_code=400, detail="Empty follow-up answer.")

#     try:
#         return await run_in_threadpool(
#             pipeline.process_followup,
#             payload.transcript,
#             payload.record,
#             payload.answer_text,
#             payload.attempts,
#             payload.asked_index,
#             payload.asked_field,
#             payload.asked_question,
#         )
#     except RuntimeError as exc:
#         raise HTTPException(status_code=502, detail=str(exc)) from exc

"""FastAPI surface. Called by the backend, never by the app directly.

The Gemini SDK is synchronous. Calling it directly inside `async def` blocks the
event loop and serializes every concurrent request, so every call goes through
run_in_threadpool.
"""

import json
from contextlib import asynccontextmanager
from typing import Optional

from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

import config
import extractor
import pipeline

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Fail at boot on a bad key or bad ASR_BACKEND, not on a seller's first sale.
    config.validate()
    config.get_client()  # warm the client so the first request isn't slower
    yield


app = FastAPI(title="KOTCHOMNOL AI backend", version="1.0.0", lifespan=lifespan)

# Dev only. Lets the test page reach this API when it's opened from the Next.js
# dev server instead of from port 8000. Node calls this service server-to-server
# and needs none of this — remove before anything public.
app.add_middleware(
    CORSMiddleware,
    # "null" is what browsers send as Origin for a page opened straight off
    # disk (file://), which is how test_ui.html is often run.
    allow_origin_regex=r"(http://(localhost|127\.0\.0\.1)(:\d+)?|null)",
    allow_methods=["*"],
    allow_headers=["*"],
)


_TEST_UI = Path(__file__).resolve().parent / "test_ui.html"


class TextRequest(BaseModel):
    transcript: str
    catalog: list[str] = []


class RecordRequest(BaseModel):
    """An edited record sent back for re-validation.

    Lets the confirmation screen's manual edits run through the same
    completeness check and the same DB mapping as a spoken record, instead of
    the frontend reimplementing either.
    """

    transcript: str = ""
    record: dict
    attempts: int = 0


class TestAudioRequest(BaseModel):
    """Audio as base64 JSON rather than multipart.

    The test page uses this because FormData cannot be structured-cloned, so
    any environment that proxies fetch across a boundary (VS Code's embedded
    browser, some extensions) throws before the request is sent. Plain JSON
    survives that. Node still uses the multipart /sale/voice endpoint.
    """

    audio_base64: str
    mime_type: str = "audio/webm"
    catalog: list[str] = []


class FollowupRequest(BaseModel):
    transcript: str
    record: dict
    answer_text: str
    attempts: int = 0
    # Echo these back from the previous response so the answer lands in the
    # right line item. A two-product sale has more than one gap to fill.
    asked_index: int = 0
    asked_field: str = "item"
    asked_question: str = ""


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "asr_backend": config.ASR_BACKEND,
        "asr_model": (
            config.ASR_PROMPTED_MODEL
            if config.ASR_BACKEND == "prompted"
            else config.ASR_TRANSCRIBE_MODEL
        ),
        "extraction_model": config.EXTRACTION_MODEL,
    }


@app.post("/sale/voice")
async def sale_voice(
    audio: UploadFile = File(...),
    mime_type: Optional[str] = Form(None),
    catalog: Optional[str] = Form(None),
) -> dict:
    """A seller has spoken a sale. Returns a record plus what to do next."""
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio upload.")

    resolved_mime = mime_type or audio.content_type or "audio/ogg"

    # Node sends the seller's known product names as a JSON array of strings.
    names = []
    if catalog:
        try:
            parsed = json.loads(catalog)
            if isinstance(parsed, list):
                names = [str(n) for n in parsed]
        except json.JSONDecodeError:
            # Biasing is an optimisation, never a reason to reject a sale.
            names = []

    try:
        return await run_in_threadpool(
            pipeline.process_audio, audio_bytes, resolved_mime, names
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        # Upstream ASR/extraction failure after retries. 502, not 500 — the
        # Node backend should surface manual entry rather than retry blindly.
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/sale/followup")
async def sale_followup(payload: FollowupRequest) -> dict:
    """The seller answered the clarification question. Continue the loop."""
    if not payload.answer_text.strip():
        raise HTTPException(status_code=400, detail="Empty follow-up answer.")

    try:
        return await run_in_threadpool(
            pipeline.process_followup,
            payload.transcript,
            payload.record,
            payload.answer_text,
            payload.attempts,
            payload.asked_index,
            payload.asked_field,
            payload.asked_question,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# --- Test surface ----------------------------------------------------------
# Dev only. Serving the page from FastAPI keeps it same-origin, so no CORS
# setup is needed. Remove both routes before this goes anywhere public.


@app.get("/test", response_class=HTMLResponse)
def test_ui() -> str:
    """Browser test page. Terminals cannot shape Khmer script; browsers can."""
    if not _TEST_UI.exists():
        raise HTTPException(status_code=404, detail="test_ui.html is missing.")
    return _TEST_UI.read_text(encoding="utf-8")


@app.post("/test/text")
async def test_text(payload: TextRequest) -> dict:
    """Skip ASR and run extraction on a typed transcript.

    Makes no transcription call at all, so the extraction prompt can be
    iterated on without burning free-tier quota or needing a recording.
    """
    transcript = payload.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Empty transcript.")

    def run():
        record = extractor.extract(transcript)
        return pipeline._resolve(transcript, record, attempts=0)

    try:
        return await run_in_threadpool(run)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/test/audio")
async def test_audio(payload: TestAudioRequest) -> dict:
    """Same pipeline as /sale/voice, but JSON in rather than multipart."""
    import base64
    import binascii

    raw = payload.audio_base64
    if "," in raw[:64]:
        raw = raw.split(",", 1)[1]  # strip a data: URL prefix if present

    try:
        audio_bytes = base64.b64decode(raw, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Bad base64 audio: {exc}") from exc

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio.")

    try:
        return await run_in_threadpool(
            pipeline.process_audio,
            audio_bytes,
            payload.mime_type or "audio/webm",
            payload.catalog,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/test/record")
async def test_record(payload: RecordRequest) -> dict:
    """Re-resolve a hand-edited record. No model calls."""
    record = extractor.normalize(payload.record or {})

    def run():
        return pipeline._resolve(payload.transcript, record, payload.attempts)

    return await run_in_threadpool(run)