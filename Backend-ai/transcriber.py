"""Voice -> text. One job.

This is the swap point. If Smean access comes through, add a `_transcribe_smean`
branch here and flip ASR_BACKEND. Nothing downstream changes, because everything
downstream only ever sees the string returned by `transcribe()`.
"""

import config
import prompts


def transcribe(
    audio_bytes: bytes,
    mime_type: str = "audio/ogg",
    catalog: list | None = None,
) -> str:
    """Return the raw transcript of a spoken sale.

    Args:
        audio_bytes: the recording, as uploaded by the Node backend.
        mime_type: prefer a compressed codec. Sending raw WAV over a mobile
            connection makes upload time dominate total latency; Opus or AAC
            at 16kHz mono is a fraction of the size with no meaningful ASR
            accuracy loss on speech.

    Raises:
        ValueError: empty audio.
        RuntimeError: the ASR call failed after retries.
    """
    if not audio_bytes:
        raise ValueError("No audio received.")

    if config.ASR_BACKEND == "prompted":
        text = _transcribe_prompted(audio_bytes, mime_type, catalog)
    else:
        # The dedicated endpoint takes no prompt, so catalog biasing and the
        # domain context are both unavailable on this path.
        text = _transcribe_endpoint(audio_bytes, mime_type)

    return text.strip()


def _audio_part(audio_bytes: bytes, mime_type: str):
    from google.genai import types

    return types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)


def _build_prompt(catalog: list | None) -> str:
    """Transcription prompt, optionally biased toward known product names.

    Naming the seller's own products stops the model spelling a familiar
    product out phonetically from scratch.
    """
    prompt = prompts.TRANSCRIPTION_PROMPT
    names = [str(n).strip() for n in (catalog or []) if str(n).strip()]
    if names:
        prompt += prompts.CATALOG_HINT.format(
            catalog="\n".join(f"- {n}" for n in names[: config.MAX_CATALOG_HINTS])
        )
    return prompt


def _transcribe_prompted(
    audio_bytes: bytes, mime_type: str, catalog: list | None = None
) -> str:
    """generate_content with an explicit transcription prompt."""
    client = config.get_client()

    def call():
        return client.models.generate_content(
            model=config.ASR_PROMPTED_MODEL,
            contents=[
                _audio_part(audio_bytes, mime_type),
                _build_prompt(catalog),
            ],
            config=config.generation_config(),
        )

    response = config.call_with_retry(call, what="Transcription")
    return _response_text(response)


def _transcribe_endpoint(audio_bytes: bytes, mime_type: str) -> str:
    """Dedicated transcription model — no prompt field, audio only."""
    client = config.get_client()

    def call():
        return client.models.generate_content(
            model=config.ASR_TRANSCRIBE_MODEL,
            contents=[_audio_part(audio_bytes, mime_type)],
            config=config.generation_config(),
        )

    response = config.call_with_retry(call, what="Transcription")
    return _response_text(response)


def _response_text(response) -> str:
    text = getattr(response, "text", None)
    if not text:
        raise RuntimeError("ASR returned an empty transcript.")
    return text