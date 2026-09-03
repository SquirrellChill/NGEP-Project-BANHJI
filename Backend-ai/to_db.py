# """Record -> BANHJI database payload. One job.

# Separate from extractor.py on purpose: extraction answers "what did the seller
# say", this answers "what rows does that become". The arithmetic lives here
# because it depends on `price_basis`, which has no column downstream and is
# consumed during the conversion.

# Emits shapes matching the schema, nothing more — inserting is Node's job:

#     sales       (sale_date, total_amount)
#     sale_items  (description, quantity, unit_price, amount)
# """

# from datetime import date, datetime, timedelta
# from decimal import ROUND_HALF_UP, Decimal, InvalidOperation

# import config

# # Sellers are in Cambodia. If the server runs UTC, a sale recorded at 00:30
# # local time would otherwise be filed under yesterday.
# _TZ_NAME = "Asia/Phnom_Penh"

# _TODAY_WORDS = ("today", "ថ្ងៃនេះ", "ថ្ងៃ​នេះ")
# _YESTERDAY_WORDS = ("yesterday", "ម្សិលមិញ", "ម្សិល​មិញ")

# # DECIMAL(12,2) / DECIMAL(10,2) in the schema.
# _MONEY = Decimal("0.01")
# _QTY = Decimal("0.01")


# def to_sale_payload(record: dict, today: date | None = None) -> dict:
#     """Convert one extracted record into insertable rows.

#     Returns:
#         {"ready": bool, "sale": {...}|None, "sale_items": [...],
#          "currency": str|None, "blockers": [...], "warnings": [...]}

#     `ready` is False whenever inserting would violate a schema constraint or
#     would require inventing a value. Node should send the seller back to the
#     confirmation screen rather than writing a partial row.
#     """
#     blockers = []
#     warnings = []

#     lines = record.get("items") or []
#     currency = _single_currency(lines, blockers)
#     sale_date = _resolve_date(record.get("date"), today, warnings)

#     sale_items = []
#     total = Decimal("0")

#     for position, line in enumerate(lines, start=1):
#         row = _line_to_row(line, position, blockers, warnings)
#         if row is None:
#             continue
#         sale_items.append(row)
#         total += Decimal(str(row["amount"]))

#     if not sale_items:
#         blockers.append("No usable line items.")

#     ready = not blockers
#     sale = None
#     if ready:
#         sale = {
#             "sale_date": sale_date.isoformat(),
#             "total_amount": _money(total),
#         }

#     return {
#         "ready": ready,
#         "currency": currency,
#         "sale": sale,
#         "sale_items": sale_items,
#         "blockers": blockers,
#         "warnings": warnings,
#     }


# def _single_currency(lines, blockers):
#     """Every priced line must agree, because the schema stores one number.

#     `sales.total_amount` has no companion currency column, so a sale mixing
#     riel and dollars has no correct representation. Refusing is the only
#     honest option — summing them would silently corrupt the row.
#     """
#     found = {line.get("currency") for line in lines if line.get("price") is not None}
#     found.discard(None)

#     if len(found) > 1:
#         blockers.append(
#             "Mixed currencies in one sale (" + ", ".join(sorted(found)) + "). "
#             "The schema has no currency column, so these cannot be totalled. "
#             "Split into separate sales, or add a currency column."
#         )
#         return None

#     if not found:
#         blockers.append("No currency on any priced line.")
#         return None

#     return found.pop()


# def _line_to_row(line, position, blockers, warnings):
#     """One line item -> one sale_items row, honouring the CHECK constraints."""
#     label = f"item {position}"

#     description = (line.get("item") or "").strip()
#     if not description:
#         # description TEXT NOT NULL
#         blockers.append(f"{label}: no product name.")
#         return None

#     unit = (line.get("unit") or "").strip()
#     if unit:
#         # No unit column in the schema, so it rides along in the description
#         # rather than being dropped.
#         description = f"{description} ({unit})"

#     quantity = _to_decimal(line.get("quantity"))
#     if quantity is None or quantity <= 0:
#         # chk_sale_items_quantity_positive CHECK (quantity > 0)
#         blockers.append(f"{label}: quantity must be greater than zero.")
#         return None

#     price = _to_decimal(line.get("price"))
#     if price is None or price < 0:
#         blockers.append(f"{label}: no usable price.")
#         return None

#     basis = line.get("price_basis")
#     if basis is None:
#         # Deliberately not a blocker: this is a toggle the confirmation screen
#         # can flip far more cheaply than a spoken follow-up. Unit pricing is
#         # how sellers normally quote, so that's the documented default.
#         basis = "unit"
#         warnings.append(
#             f"{label}: unclear whether {price} is per-{unit or 'item'} or the "
#             "line total. Assumed per item — confirm before saving."
#         )

#     if basis == "total":
#         amount = price
#         unit_price = price / quantity
#     else:
#         unit_price = price
#         amount = price * quantity

#     return {
#         "description": description,
#         "quantity": _money(quantity, _QTY),
#         "unit_price": _money(unit_price),
#         "amount": _money(amount),
#     }


# def _resolve_date(value, today, warnings):
#     """Relative term -> a real DATE, in Cambodian local time."""
#     if today is None:
#         today = _local_today(warnings)

#     text = (value or "").strip().lower()

#     if not text:
#         warnings.append("No date spoken. Defaulted to today.")
#         return today
#     if any(word in text for word in _TODAY_WORDS):
#         return today
#     if any(word in text for word in _YESTERDAY_WORDS):
#         return today - timedelta(days=1)

#     for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
#         try:
#             return datetime.strptime(text, fmt).date()
#         except ValueError:
#             continue

#     warnings.append(f"Could not read the date {value!r}. Defaulted to today.")
#     return today


# def _local_today(warnings):
#     try:
#         from zoneinfo import ZoneInfo

#         return datetime.now(ZoneInfo(_TZ_NAME)).date()
#     except Exception:
#         # Windows has no system tz database — `pip install tzdata` fixes it.
#         warnings.append(
#             f"Timezone {_TZ_NAME} unavailable, used server local time. "
#             "Install tzdata if dates near midnight look wrong."
#         )
#         return date.today()


# def _to_decimal(value):
#     if value is None or isinstance(value, bool):
#         return None
#     try:
#         return Decimal(str(value))
#     except (InvalidOperation, ValueError):
#         return None


# def _money(value, quant=_MONEY):
#     """Round to the schema's scale and hand back a plain float for JSON."""
#     return float(Decimal(value).quantize(quant, rounding=ROUND_HALF_UP))

"""Record -> BANHJI database payload. One job.

Separate from extractor.py on purpose: extraction answers "what did the seller
say", this answers "what rows does that become". The arithmetic lives here
because it depends on `price_basis`, which has no column downstream and is
consumed during the conversion.

Emits shapes matching the schema, nothing more — inserting is Node's job:

    sales       (sale_date, total_amount)
    sale_items  (description, quantity, unit_price, amount)
"""

from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation

import config

# Sellers are in Cambodia. If the server runs UTC, a sale recorded at 00:30
# local time would otherwise be filed under yesterday.
_TZ_NAME = "Asia/Phnom_Penh"

_TODAY_WORDS = ("today", "ថ្ងៃនេះ", "ថ្ងៃ​នេះ")
_YESTERDAY_WORDS = ("yesterday", "ម្សិលមិញ", "ម្សិល​មិញ")

# DECIMAL(12,2) / DECIMAL(10,2) in the schema.
_MONEY = Decimal("0.01")
_QTY = Decimal("0.01")


def to_sale_payload(record: dict, today: date | None = None) -> dict:
    """Convert one extracted record into insertable rows.

    Returns:
        {"ready": bool, "sale": {...}|None, "sale_items": [...],
         "currency": str|None, "blockers": [...], "warnings": [...]}

    `ready` is False whenever inserting would violate a schema constraint or
    would require inventing a value. Node should send the seller back to the
    confirmation screen rather than writing a partial row.
    """
    blockers = []
    warnings = []

    lines = record.get("items") or []
    currency = _single_currency(lines, blockers)
    sale_date = _resolve_date(record.get("date"), today, warnings)

    sale_items = []
    total = Decimal("0")

    for position, line in enumerate(lines, start=1):
        row = _line_to_row(line, position, blockers, warnings)
        if row is None:
            continue
        sale_items.append(row)
        total += Decimal(str(row["amount"]))

    if not sale_items:
        blockers.append("No usable line items.")

    ready = not blockers
    sale = None
    if ready:
        sale = {
            "sale_date": sale_date.isoformat(),
            "total_amount": _money(total),
        }

    return {
        "ready": ready,
        "currency": currency,
        "sale": sale,
        "sale_items": sale_items,
        "blockers": blockers,
        "warnings": warnings,
    }


def _single_currency(lines, blockers):
    """Every priced line must agree, because the schema stores one number.

    `sales.total_amount` has no companion currency column, so a sale mixing
    riel and dollars has no correct representation. Refusing is the only
    honest option — summing them would silently corrupt the row.
    """
    found = {line.get("currency") for line in lines if line.get("price") is not None}
    found.discard(None)

    if len(found) > 1:
        blockers.append(
            "Mixed currencies in one sale (" + ", ".join(sorted(found)) + "). "
            "The schema has no currency column, so these cannot be totalled. "
            "Split into separate sales, or add a currency column."
        )
        return None

    if not found:
        blockers.append("No currency on any priced line.")
        return None

    return found.pop()


def _line_to_row(line, position, blockers, warnings):
    """One line item -> one sale_items row, honouring the CHECK constraints."""
    label = f"item {position}"

    description = (line.get("item") or "").strip()
    if not description:
        # description TEXT NOT NULL
        blockers.append(f"{label}: no product name.")
        return None

    unit = (line.get("unit") or "").strip()
    if unit:
        # No unit column in the schema, so it rides along in the description
        # rather than being dropped.
        description = f"{description} ({unit})"

    quantity = _to_decimal(line.get("quantity"))
    if quantity is None or quantity <= 0:
        # chk_sale_items_quantity_positive CHECK (quantity > 0)
        blockers.append(f"{label}: quantity must be greater than zero.")
        return None

    price = _to_decimal(line.get("price"))
    if price is None or price < 0:
        blockers.append(f"{label}: no usable price.")
        return None

    basis = line.get("price_basis")
    if basis is None:
        # Deliberately not a blocker: this is a toggle the confirmation screen
        # can flip far more cheaply than a spoken follow-up. Unit pricing is
        # how sellers normally quote, so that's the documented default.
        basis = "unit"
        warnings.append(
            f"{label}: unclear whether {price} is per-{unit or 'item'} or the "
            "line total. Assumed per item — confirm before saving."
        )

    if basis == "total":
        amount = price
        unit_price = price / quantity
    else:
        unit_price = price
        amount = price * quantity

    return {
        "description": description,
        "quantity": _money(quantity, _QTY),
        "unit_price": _money(unit_price),
        "amount": _money(amount),
    }


def _resolve_date(value, today, warnings):
    """Relative term -> a real DATE, in Cambodian local time."""
    if today is None:
        today = _local_today(warnings)

    text = (value or "").strip().lower()

    if not text:
        warnings.append("No date spoken. Defaulted to today.")
        return today
    if any(word in text for word in _TODAY_WORDS):
        return today
    if any(word in text for word in _YESTERDAY_WORDS):
        return today - timedelta(days=1)

    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue

    warnings.append(f"Could not read the date {value!r}. Defaulted to today.")
    return today


def _local_today(warnings):
    try:
        from zoneinfo import ZoneInfo

        return datetime.now(ZoneInfo(_TZ_NAME)).date()
    except Exception:
        # Windows has no system tz database — `pip install tzdata` fixes it.
        warnings.append(
            f"Timezone {_TZ_NAME} unavailable, used server local time. "
            "Install tzdata if dates near midnight look wrong."
        )
        return date.today()


def _to_decimal(value):
    if value is None or isinstance(value, bool):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def _money(value, quant=_MONEY):
    """Round to the schema's scale and hand back a plain float for JSON."""
    return float(Decimal(value).quantize(quant, rounding=ROUND_HALF_UP))