# TRANSCRIBE_PROMPT = """Transcribe the audio faithfully. The speaker is a Cambodian
# seller who may mix Khmer and English.

# Rules:
# - Khmer words -> Khmer script; English/product/brand names -> correct English spelling.
# - Preserve Khmer-English mixing; never translate or transliterate.
# - Keep natural speech, grammar, and fillers, but fix obvious Khmer spelling errors.
# - Convert spoken numbers to digits (e.g. "ដប់" / "ten" -> 10).
# - Preserve prices and currencies exactly as spoken; never convert or guess.
# - Do not invent unclear words.

# Output ONLY the transcription. No labels or explanations."""


# EXTRACT_PROMPT = """Extract sales data from this Khmer/English transcript as JSON.

# Fields: item, quantity, price, date
# - item: keep in whichever language it was spoken (Khmer script or English/Latin) — never translate.
# - quantity, price: numeric digits only.
# - date: simple relative term ("today", "yesterday") if mentioned, else null.
# - If a field is not mentioned, use null. Never guess or invent a value.

# Transcript: {transcript}

# Output ONLY valid JSON in this exact format, no other text:
# {{"item": "...", "quantity": ..., "price": ..., "date": "..."}}"""


# # One short, natural Khmer follow-up question per missing field.
# # Extend this dict as you learn which phrasing works best with real sellers.
# FOLLOWUP_QUESTIONS = {
#     "item": "តើអ្នកលក់អ្វី?",
#     "quantity": "លក់បានប៉ុន្មាន?",
#     "price": "តម្លៃប៉ុន្មានក្នុងមួយឯកតា?",
# }


# """All prompts live here. Logic files import them; they never inline a prompt.

# Prompts are kept short on purpose — every token here is an input token on
# every single call, which costs latency and burns free-tier quota.
# """

# # --- Transcription ---------------------------------------------------------
# # Only used by the "prompted" ASR backend. The dedicated transcription endpoint
# # takes no prompt field, which means it cannot be given the domain context or
# # the seller's catalogue below — a real reason to prefer "prompted".
# TRANSCRIPTION_PROMPT = """Transcribe this audio exactly as spoken.

# Context: a small Cambodian shop seller recording a sale out loud. Expect
# product names (drinks, snacks, everyday goods), counts, units, and prices in
# riel or US dollars.

# Rules:
# - Khmer speech -> Khmer script. English words -> Latin script.
# - International product and brand names go in LATIN script even when spoken
#   with Khmer pronunciation: matcha, latte, Coca-Cola, Sprite, Nescafe.
#   Only genuinely Khmer product words stay in Khmer script (តែបៃតង, នំបុ័ង).
# - Do NOT translate. Do NOT transliterate brand names into Khmer script.
# - Write numbers and currency exactly as spoken. Never convert currencies.
# - Keep Khmer words whole — do not split one word into two.
# - Output the transcript only. No commentary, no formatting."""

# # Appended to TRANSCRIPTION_PROMPT when the seller's past products are known.
# CATALOG_HINT = """
# This seller has previously sold these products. If what you hear closely
# matches one, transcribe it as written here rather than spelling it out
# phonetically:
# {catalog}"""


# # --- Extraction ------------------------------------------------------------
# # One recording is one sale. A sale can have several line items, but only one
# # date, so `date` sits at the top level and never repeats per line.
# EXTRACTION_PROMPT = """Extract a sales record from this Cambodian seller's speech.

# Transcript:
# {transcript}

# Return ONLY a JSON object shaped exactly like this:
# {{"items": [{{"item": ..., "quantity": ..., "unit": ..., "price": ...,
#              "currency": ..., "price_basis": ...}}], "date": ...}}

# Rules:
# - One entry in "items" per distinct product mentioned, in the order spoken.
# - item: keep the language it was spoken in. Khmer -> Khmer script,
#   international brand/product names -> Latin script. Never translate.
# - quantity: digits only. Convert spoken numbers ("ដប់" -> 10, "three" -> 3).
# - unit: the counting word if one was spoken (កែវ, កំប៉ុង, ដប, kg). Else null.
# - price: digits only. "១ ម៉ឺន" is 10000. Never convert between currencies,
#   never guess an unstated amount, never split a lump total across products.
# - currency: "KHR" if riel (រៀល, ៛), "USD" if dollars (ដុល្លារ, $).
#   If a price was stated but the currency was not, null. Never assume.
# - price_basis: "unit" if the price is per single item ("one glass 3 dollars",
#   "ក្នុងមួយកែវ"). "total" if it is the whole line. null if genuinely unclear.
# - date: one relative term for the whole sale ("today", "yesterday") unless a
#   specific date is stated. Never per-item.
# - Any value not clearly stated: null. Never guess, never invent.

# No markdown fences, no explanation. JSON only."""


# # --- Follow-up answer parsing ----------------------------------------------
# # Used only when the seller's answer isn't already plain digits or an obvious
# # currency word.
# FIELD_ANSWER_PROMPT = """The seller was asked: {question}
# They answered: {answer}

# Return ONLY a JSON object: {{"value": ...}}

# - The value is for the field "{field}".
# - quantity and price: digits only, convert spoken numbers.
# - currency: exactly "KHR" or "USD".
# - item: keep the spoken language and script, never translate.
# - If the answer doesn't actually contain the value, return null.

# JSON only."""


# # --- Clarification loop ----------------------------------------------------
# # Templates, not model calls. Detecting a gap is a dict check, so identifying
# # and phrasing the next question costs no network round-trip.
# #
# # REVIEW NEEDED: these strings are read aloud to sellers. Have a native Khmer
# # speaker check the wording and spelling before release. The {item} and
# # {position} placeholders must survive any rewording.
# FOLLOWUP_QUESTIONS = {
#     "item": "តើអីវ៉ាន់ទី {position} ជាអ្វី?",
#     "quantity": "តើ {item} ប៉ុន្មាន?",
#     "price": "តើ {item} តម្លៃប៉ុន្មាន?",
#     "currency": "តើ {item} គិតជា រៀល ឬ ដុល្លារ?",
# }

# # Fallback when the product name itself isn't known yet.
# FOLLOWUP_QUESTIONS_UNNAMED = {
#     "quantity": "តើអីវ៉ាន់ទី {position} ប៉ុន្មាន?",
#     "price": "តើអីវ៉ាន់ទី {position} តម្លៃប៉ុន្មាន?",
#     "currency": "តើអីវ៉ាន់ទី {position} គិតជា រៀល ឬ ដុល្លារ?",
# }


"""All prompts live here. Logic files import them; they never inline a prompt.

Prompts are kept short on purpose — every token here is an input token on
every single call, which costs latency and burns free-tier quota.
"""

# --- Transcription ---------------------------------------------------------
# Only used by the "prompted" ASR backend. The dedicated transcription endpoint
# takes no prompt field, which means it cannot be given the domain context or
# the seller's catalogue below — a real reason to prefer "prompted".
TRANSCRIPTION_PROMPT = """Transcribe this audio exactly as spoken.

Context: a small Cambodian shop seller recording a sale out loud. Expect
product names (drinks, snacks, everyday goods), counts, units, and prices in
riel or US dollars.

Rules:
- Khmer speech -> Khmer script. English words -> Latin script.
- International product and brand names go in LATIN script even when spoken
  with Khmer pronunciation: matcha, latte, Coca-Cola, Sprite, Nescafe.
  Only genuinely Khmer product words stay in Khmer script (តែបៃតង, នំបុ័ង).
- Do NOT translate. Do NOT transliterate brand names into Khmer script.
- Write numbers and currency exactly as spoken. Never convert currencies.
- Keep Khmer words whole — do not split one word into two.
- Output the transcript only. No commentary, no formatting."""

# Appended to TRANSCRIPTION_PROMPT when the seller's past products are known.
CATALOG_HINT = """
This seller has previously sold these products. If what you hear closely
matches one, transcribe it as written here rather than spelling it out
phonetically:
{catalog}"""


# --- Extraction ------------------------------------------------------------
# One recording is one sale. A sale can have several line items, but only one
# date, so `date` sits at the top level and never repeats per line.
EXTRACTION_PROMPT = """Extract a sales record from this Cambodian seller's speech.

Transcript:
{transcript}

Return ONLY a JSON object shaped exactly like this:
{{"items": [{{"item": ..., "quantity": ..., "unit": ..., "price": ...,
             "currency": ..., "price_basis": ...}}],
 "date": ..., "payment_method": ...}}

Rules:
- One entry in "items" per distinct product mentioned, in the order spoken.
- item: keep the language it was spoken in. Khmer -> Khmer script,
  international brand/product names -> Latin script. Never translate.
- quantity: digits only. Convert spoken numbers ("ដប់" -> 10, "three" -> 3).
- unit: the counting word if one was spoken (កែវ, កំប៉ុង, ដប, kg). Else null.
- price: digits only. "១ ម៉ឺន" is 10000. Never convert between currencies,
  never guess an unstated amount, never split a lump total across products.
- currency: "KHR" if riel (រៀល, ៛), "USD" if dollars (ដុល្លារ, $).
  If a price was stated but the currency was not, null. Never assume.
- price_basis: "unit" if the price is per single item ("one glass 3 dollars",
  "ក្នុងមួយកែវ"). "total" if it is the whole line. null if genuinely unclear.
- date: one relative term for the whole sale ("today", "yesterday") unless a
  specific date is stated. Never per-item.
- payment_method: one value for the whole sale.
    "cash"   paid in notes (សាច់ប្រាក់, cash)
    "bank"   QR scan or transfer (ស្កេន, scan, KHQR, ផ្ទេរប្រាក់, ធនាគារ,
             ABA, Wing, ACLEDA, TrueMoney)
    "credit" not paid yet, owed (ជំពាក់, មិនទាន់បង់, ជាប់ជំពាក់, owes, later)
    null     not mentioned at all, OR two methods mentioned and it is unclear
             which applies. Never guess between them.
- Any value not clearly stated: null. Never guess, never invent.

No markdown fences, no explanation. JSON only."""


# --- Follow-up answer parsing ----------------------------------------------
# Used only when the seller's answer isn't already plain digits or an obvious
# currency word.
FIELD_ANSWER_PROMPT = """The seller was asked: {question}
They answered: {answer}

Return ONLY a JSON object: {{"value": ...}}

- The value is for the field "{field}" ONLY. If the answer mentions numbers
  or details for OTHER fields too (e.g. a quantity or unit count alongside a
  price), ignore those and return only the value for "{field}".
- quantity and price: digits only, convert spoken numbers.
- currency: exactly "KHR" or "USD".
- item: keep the spoken language and script, never translate.
- If the answer doesn't actually contain the value for "{field}", return null.

Example: field is "price", answer is "១គោ ២៥០០រៀល" (1 cow, 2500 riel)
-> {{"value": 2500}}

Example: field is "quantity", answer is "១គោ ២៥០០រៀល" (1 cow, 2500 riel)
-> {{"value": 1}}

JSON only."""


# --- Clarification loop ----------------------------------------------------
# Templates, not model calls. Detecting a gap is a dict check, so identifying
# and phrasing the next question costs no network round-trip.
#
# REVIEW NEEDED: these strings are read aloud to sellers. Have a native Khmer
# speaker check the wording and spelling before release. The {item} and
# {position} placeholders must survive any rewording.
FOLLOWUP_QUESTIONS = {
    "item": "តើអីវ៉ាន់ទី {position} ជាអ្វី?",
    "quantity": "តើ {item} ប៉ុន្មាន?",
    "price": "តើ {item} តម្លៃប៉ុន្មាន?",
    "currency": "តើ {item} គិតជា រៀល ឬ ដុល្លារ?",
}

# Fallback when the product name itself isn't known yet.
FOLLOWUP_QUESTIONS_UNNAMED = {
    "quantity": "តើអីវ៉ាន់ទី {position} ប៉ុន្មាន?",
    "price": "តើអីវ៉ាន់ទី {position} តម្លៃប៉ុន្មាន?",
    "currency": "តើអីវ៉ាន់ទី {position} គិតជា រៀល ឬ ដុល្លារ?",
}

# Add this to Backend/app/services/prompts.py, alongside the other
# follow-up-related prompts (near FIELD_ANSWER_PROMPT).
#
# Required by extractor.extract_followup_updates(), which calls:
#   FOLLOWUP_FREEFORM_PROMPT.format(question=question, record_json=..., answer=answer)
# and expects the response JSON to have an "updates" list of
# {"index": int, "field": str, "value": ...} objects.

FOLLOWUP_FREEFORM_PROMPT = """A seller was asked a follow-up question about their sale.
They may answer just that question, answer several gaps at once, or correct
something already recorded -- pull out every fillable or correctable value
you can find, not only the one field that was asked about.

Current record (only incomplete items show all fields; complete items are
trimmed to just their name, to keep this short):
{record_json}

They were asked: {question}
They answered: {answer}

For each value you can confidently attribute to a specific item and field,
return an entry. Only use "index" values that exist in the record above --
never invent a new item or a new index.

Valid fields: item, quantity, unit, price, currency, price_basis.

Rules:
- quantity: digits only, convert spoken numbers.
- price: digits only. Never convert between currencies, never split a lump
  total across items.
- currency: exactly "KHR" or "USD".
- item: keep the spoken language and script, never translate.
- If the answer corrects a field that already has a value (e.g. the item
  name was misheard), include that correction too -- do not skip it just
  because a value is already present.
- If nothing in the answer can be confidently attributed, return an empty list.
- Never guess a value that wasn't actually stated.

Return ONLY a JSON object shaped exactly like this:
{{"updates": [{{"index": 0, "field": "price", "value": 2500}}]}}

No markdown fences, no explanation. JSON only."""