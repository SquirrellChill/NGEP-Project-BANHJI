"""Sales endpoints. Every route is scoped to the authenticated seller.

The create shape matches what the AI backend returns once the seller taps
confirm, so the app can pass a confirmed record straight through.
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repositories import transaction_repository as repo
from app.schemas.transaction import SaleCreate, SaleRead, SummaryRead
from app.services import transaction_service as service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Store a confirmed sale.

    Totals are computed from the line items, not read from the request, so a
    client can't submit a header that disagrees with its own rows.
    """
    return service.create_sale(db, current_user.user_id, payload)


@router.get("", response_model=list[SaleRead])
def list_sales(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """This seller's sales, newest first."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(400, "start_date cannot be after end_date.")
    return repo.list_sales(
        db, current_user.user_id, start_date, end_date, limit, offset
    )


@router.get("/summary", response_model=SummaryRead)
def get_summary(
    period: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    anchor: date | None = Query(
        None, description="Any date inside the period. Defaults to today."
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Income for a day, week, or month.

    Returns one entry per currency — riel and dollars are never added together,
    because that needs an exchange rate that drifts and would make stored
    history wrong the moment it moves.
    """
    return service.summarise(db, current_user.user_id, period, anchor)


# Declared after /summary so the literal path isn't swallowed by {sale_id}.
@router.put("/{sale_id}", response_model=SaleRead)
def update_sale(
    sale_id: int,
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sale = service.update_sale(db, current_user.user_id, sale_id, payload)
    if sale is None:
        raise HTTPException(404, "Sale not found.")
    return sale


@router.get("/{sale_id}", response_model=SaleRead)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sale = repo.find_sale(db, current_user.user_id, sale_id)
    if sale is None:
        raise HTTPException(404, "Sale not found.")
    return sale


@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not repo.delete_sale(db, current_user.user_id, sale_id):
        raise HTTPException(404, "Sale not found.")
