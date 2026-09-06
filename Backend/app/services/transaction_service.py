"""Business rules for sales: totals and date ranges.

Everything here is arithmetic and policy. Nothing talks to the database
directly — that's the repository's job — and nothing knows about HTTP.
"""

from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy.orm import Session

from app.repositories import transaction_repository as repo
from app.schemas.transaction import CurrencyTotals, SaleCreate, SummaryRead

# Sellers are in Cambodia. A server on UTC would file a 9pm sale under the
# wrong day, and the seller would open the app to a total that looks short.
TZ_NAME = "Asia/Phnom_Penh"

MONEY = Decimal("0.01")
CURRENCIES = ("KHR", "USD")


def today_local() -> date:
    try:
        from zoneinfo import ZoneInfo

        return datetime.now(ZoneInfo(TZ_NAME)).date()
    except Exception:
        # Windows ships no tz database — `pip install tzdata` fixes it.
        return date.today()


def _money(value: Decimal) -> Decimal:
    return Decimal(value).quantize(MONEY, rounding=ROUND_HALF_UP)


def create_sale(db: Session, user_id: int, payload: SaleCreate):
    """Store a confirmed sale, computing every total from the line items.

    Totals are never taken from the client. A header that disagrees with its
    own rows is the kind of error nobody notices until a monthly report is
    wrong, so the only trustworthy total is one derived at write time.
    """
    rows = []
    totals = {currency: Decimal("0") for currency in CURRENCIES}

    for item in payload.items:
        amount = _money(item.quantity * item.unit_price)
        totals[item.currency] += amount
        rows.append(
            {
                "description": item.description,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "currency": item.currency,
                "amount": amount,
            }
        )

    return repo.create_sale(
        db,
        user_id=user_id,
        sale_date=payload.sale_date,
        total_khr=_money(totals["KHR"]),
        total_usd=_money(totals["USD"]),
        items=rows,
    )


def update_sale(db: Session, user_id: int, sale_id: int, payload: SaleCreate):
    """Replace a seller's sale with a confirmed edited version."""
    sale = repo.find_sale(db, user_id, sale_id)
    if sale is None:
        return None

    rows = []
    totals = {currency: Decimal("0") for currency in CURRENCIES}

    for item in payload.items:
        amount = _money(item.quantity * item.unit_price)
        totals[item.currency] += amount
        rows.append(
            {
                "description": item.description,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "currency": item.currency,
                "amount": amount,
            }
        )

    return repo.update_sale(
        db,
        sale=sale,
        sale_date=payload.sale_date,
        total_khr=_money(totals["KHR"]),
        total_usd=_money(totals["USD"]),
        items=rows,
    )


def resolve_period(period: str, anchor: date | None = None) -> tuple[date, date]:
    """Turn a period name into inclusive start and end dates.

    Weeks run Monday to Sunday, which is the Cambodian convention. Months run
    calendar month. Both are computed from an anchor date so a seller can look
    back at any week, not only the current one.
    """
    anchor = anchor or today_local()

    if period == "daily":
        return anchor, anchor

    if period == "weekly":
        start = anchor - timedelta(days=anchor.weekday())
        return start, start + timedelta(days=6)

    if period == "monthly":
        start = anchor.replace(day=1)
        if start.month == 12:
            next_month = start.replace(year=start.year + 1, month=1)
        else:
            next_month = start.replace(month=start.month + 1)
        return start, next_month - timedelta(days=1)

    raise ValueError(f"unknown period: {period}")


def summarise(
    db: Session, user_id: int, period: str, anchor: date | None = None
) -> SummaryRead:
    """Income for a day, week, or month, one figure per currency."""
    start_date, end_date = resolve_period(period, anchor)
    khr, usd = repo.sum_totals(db, user_id, start_date, end_date)

    return SummaryRead(
        period=period,
        start_date=start_date,
        end_date=end_date,
        sales_count=repo.count_sales(db, user_id, start_date, end_date),
        totals=[
            CurrencyTotals(currency="KHR", total=_money(khr)),
            CurrencyTotals(currency="USD", total=_money(usd)),
        ],
    )
