# """Reconcile transcribed product names against what the seller actually sells.

# One job, separate from extraction: extraction answers "what did the ASR hear",
# this answers "which known product was that". Sellers work from a small
# repeating set, so a near-miss like តែ ប៉ិទង for តែបៃតង is recognisable even
# though the transcription is wrong.

# Uses difflib from the standard library. rapidfuzz is faster and has better
# partial-match scoring — worth swapping in if catalogues get large — but this
# needs no extra dependency.
# """

# import unicodedata
# from difflib import SequenceMatcher

# import config

# # Zero-width characters. Khmer uses ZWSP (U+200B) for word boundaries, so the
# # same product name can be stored with or without them and compare unequal
# # despite looking identical. Also strip ZWNJ/ZWJ, which vary by keyboard.
# _INVISIBLE = dict.fromkeys(map(ord, "\u200b\u200c\u200d\ufeff"), None)


# def normalize(text: str) -> str:
#     """Canonical form for comparison. Not for display — never store this.

#     NFC composes Khmer sequences that can be encoded more than one way, so
#     two visually identical names stop hashing differently.
#     """
#     if not text:
#         return ""
#     text = unicodedata.normalize("NFC", text)
#     text = text.translate(_INVISIBLE)
#     # Khmer doesn't space between words; ASR inserts spaces inconsistently,
#     # which is exactly the តែ ប៉ិទង / តែបៃតង split. Ignore spacing entirely.
#     return "".join(text.split()).lower()


# def similarity(a: str, b: str) -> float:
#     """0.0 to 1.0 on the normalized forms."""
#     na, nb = normalize(a), normalize(b)
#     if not na or not nb:
#         return 0.0
#     if na == nb:
#         return 1.0
#     return SequenceMatcher(None, na, nb).ratio()


# def best_match(name: str, catalog):
#     """Closest catalogue entry, or None.

#     Returns (matched_name, score). Only above the confidence threshold —
#     below it, leaving the transcription alone is safer than snapping to the
#     wrong product. Short names are especially dangerous here, which is why
#     the threshold rises as names get shorter.
#     """
#     if not name or not catalog:
#         return None

#     scored = [(entry, similarity(name, entry)) for entry in catalog if entry]
#     if not scored:
#         return None

#     entry, score = max(scored, key=lambda pair: pair[1])
#     if score < _threshold(name, entry):
#         return None
#     return entry, score


# def reconcile(record: dict, catalog) -> dict:
#     """Snap each line's item name to a known product where confident.

#     Returns a new record plus a `matches` list describing what changed, so
#     the confirmation screen can show the seller what was corrected rather
#     than silently rewriting what they said.
#     """
#     catalog = [str(c).strip() for c in (catalog or []) if str(c).strip()]
#     items = [dict(line) for line in record.get("items") or []]
#     matches = []

#     if catalog:
#         for index, line in enumerate(items):
#             spoken = line.get("item")
#             if not spoken:
#                 continue
#             hit = best_match(spoken, catalog)
#             if not hit:
#                 continue
#             matched, score = hit
#             if normalize(matched) == normalize(spoken):
#                 continue  # same product, just spacing or encoding
#             matches.append(
#                 {"index": index, "heard": spoken, "matched": matched,
#                  "score": round(score, 3)}
#             )
#             items[index]["item"] = matched

#     return {"record": {"items": items, "date": record.get("date")},
#             "matches": matches}


# def _threshold(a: str, b: str) -> float:
#     """Shorter names need a higher score.

#     Two three-character names can share two characters and score 0.67 while
#     being unrelated products. Snapping those is worse than leaving the
#     transcription wrong, because a wrong name looks correct on the
#     confirmation screen and gets approved.
#     """
#     shortest = min(len(normalize(a)), len(normalize(b)))
#     if shortest <= 4:
#         return 0.95
#     if shortest <= 8:
#         return config.CATALOG_MATCH_THRESHOLD + 0.08
#     return config.CATALOG_MATCH_THRESHOLD

"""Reconcile transcribed product names against what the seller actually sells.

One job, separate from extraction: extraction answers "what did the ASR hear",
this answers "which known product was that". Sellers work from a small
repeating set, so a near-miss like តែ ប៉ិទង for តែបៃតង is recognisable even
though the transcription is wrong.

Uses difflib from the standard library. rapidfuzz is faster and has better
partial-match scoring — worth swapping in if catalogues get large — but this
needs no extra dependency.
"""

import unicodedata
from difflib import SequenceMatcher

from app.core.config import settings

# Zero-width characters. Khmer uses ZWSP (U+200B) for word boundaries, so the
# same product name can be stored with or without them and compare unequal
# despite looking identical. Also strip ZWNJ/ZWJ, which vary by keyboard.
_INVISIBLE = dict.fromkeys(map(ord, "\u200b\u200c\u200d\ufeff"), None)


def normalize(text: str) -> str:
    """Canonical form for comparison. Not for display — never store this.

    NFC composes Khmer sequences that can be encoded more than one way, so
    two visually identical names stop hashing differently.
    """
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text)
    text = text.translate(_INVISIBLE)
    # Khmer doesn't space between words; ASR inserts spaces inconsistently,
    # which is exactly the តែ ប៉ិទង / តែបៃតង split. Ignore spacing entirely.
    return "".join(text.split()).lower()


def similarity(a: str, b: str) -> float:
    """0.0 to 1.0 on the normalized forms."""
    na, nb = normalize(a), normalize(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    return SequenceMatcher(None, na, nb).ratio()


def best_match(name: str, catalog):
    """Closest catalogue entry, or None.

    Returns (matched_name, score). Only above the confidence threshold —
    below it, leaving the transcription alone is safer than snapping to the
    wrong product. Short names are especially dangerous here, which is why
    the threshold rises as names get shorter.
    """
    if not name or not catalog:
        return None

    scored = [(entry, similarity(name, entry)) for entry in catalog if entry]
    if not scored:
        return None

    entry, score = max(scored, key=lambda pair: pair[1])
    if score < _threshold(name, entry):
        return None
    return entry, score


def reconcile(record: dict, catalog) -> dict:
    """Snap each line's item name to a known product where confident.

    Returns a new record plus a `matches` list describing what changed, so
    the confirmation screen can show the seller what was corrected rather
    than silently rewriting what they said.
    """
    catalog = [str(c).strip() for c in (catalog or []) if str(c).strip()]
    items = [dict(line) for line in record.get("items") or []]
    matches = []

    if catalog:
        for index, line in enumerate(items):
            spoken = line.get("item")
            if not spoken:
                continue
            hit = best_match(spoken, catalog)
            if not hit:
                continue
            matched, score = hit
            if normalize(matched) == normalize(spoken):
                continue  # same product, just spacing or encoding
            matches.append(
                {"index": index, "heard": spoken, "matched": matched,
                 "score": round(score, 3)}
            )
            items[index]["item"] = matched

    return {"record": {"items": items, "date": record.get("date"),
                       "payment_method": record.get("payment_method")},
            "matches": matches}


def _threshold(a: str, b: str) -> float:
    """Shorter names need a higher score.

    Two three-character names can share two characters and score 0.67 while
    being unrelated products. Snapping those is worse than leaving the
    transcription wrong, because a wrong name looks correct on the
    confirmation screen and gets approved.
    """
    shortest = min(len(normalize(a)), len(normalize(b)))
    if shortest <= 4:
        return 0.95
    if shortest <= 8:
        return settings.CATALOG_MATCH_THRESHOLD + 0.08
    return settings.CATALOG_MATCH_THRESHOLD