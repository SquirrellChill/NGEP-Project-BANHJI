"""Database access for sales and their line items.

Queries only — no business rules. Ownership is enforced here by taking
user_id on every lookup, so a caller cannot read or delete another seller's
sale by guessing an id.
"""

from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.sale import Sale
from app.models.sale_item import SaleItem


def create_sale(
    db: Session,
    user_id: int,
    sale_date: date,
    total_khr: Decimal,
    total_usd: Decimal,
    items: list[dict],
) -> Sale:
    """Insert a sale and its line items in one transaction.

    Either the whole receipt lands or none of it does — a header with no rows
    would show up in every total as a phantom sale.
    """
    sale = Sale(
        user_id=user_id,
        sale_date=sale_date,
        total_khr=total_khr,
        total_usd=total_usd,
    )
    db.add(sale)
    db.flush()  # assigns sale_id without committing

    for row in items:
        db.add(SaleItem(sale_id=sale.sale_id, **row))

    db.commit()
    db.refresh(sale)
    return sale


def update_sale(
    db: Session,
    sale: Sale,
    sale_date: date,
    total_khr: Decimal,
    total_usd: Decimal,
    items: list[dict],
) -> Sale:
    """Replace a sale's header date and rows, then persist recalculated totals."""
    sale.sale_date = sale_date
    sale.total_khr = total_khr
    sale.total_usd = total_usd
    sale.items.clear()
    db.flush()

    for row in items:
        sale.items.append(SaleItem(**row))

    db.commit()
    db.refresh(sale)
    return sale


def find_sale(db: Session, user_id: int, sale_id: int) -> Sale | None:
    return (
        db.query(Sale)
        .options(selectinload(Sale.items))
        .filter(Sale.sale_id == sale_id, Sale.user_id == user_id)
        .first()
    )


def list_sales(
    db: Session,
    user_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Sale]:
    query = db.query(Sale).options(selectinload(Sale.items)).filter(
        Sale.user_id == user_id
    )
    if start_date:
        query = query.filter(Sale.sale_date >= start_date)
    if end_date:
        query = query.filter(Sale.sale_date <= end_date)

    return (
        query.order_by(Sale.sale_date.desc(), Sale.sale_id.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )


def delete_sale(db: Session, user_id: int, sale_id: int) -> bool:
    sale = db.query(Sale).filter(
        Sale.sale_id == sale_id, Sale.user_id == user_id
    ).first()
    if sale is None:
        return False
    db.delete(sale)  # cascade removes the line items
    db.commit()
    return True


def sum_totals(
    db: Session, user_id: int, start_date: date, end_date: date
) -> tuple[Decimal, Decimal]:
    """Riel and dollar totals over a date range.

    Summing in SQL rather than looping in Python keeps this fast as a seller's
    history grows, and it's the same query for daily, weekly, and monthly —
    only the dates change.
    """
    khr, usd = (
        db.query(
            func.coalesce(func.sum(Sale.total_khr), 0),
            func.coalesce(func.sum(Sale.total_usd), 0),
        )
        .filter(
            Sale.user_id == user_id,
            Sale.sale_date >= start_date,
            Sale.sale_date <= end_date,
        )
        .one()
    )
    return Decimal(khr), Decimal(usd)


def count_sales(db: Session, user_id: int, start_date: date, end_date: date) -> int:
    return (
        db.query(func.count(Sale.sale_id))
        .filter(
            Sale.user_id == user_id,
            Sale.sale_date >= start_date,
            Sale.sale_date <= end_date,
        )
        .scalar()
        or 0
    )
