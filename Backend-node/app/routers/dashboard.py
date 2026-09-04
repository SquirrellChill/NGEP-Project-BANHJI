# app/routers/dashboard.py
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.dashboard import DashboardSummaryOut, RecentTransactionOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

EXCHANGE_RATE = 4100.00


@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    target_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query_date = target_date or date.today()

    # Aggregate both KHR and USD totals for the user on the selected sale_date
    result = (
        db.query(
            func.coalesce(func.sum(Sale.total_khr), 0).label("sum_khr"),
            func.coalesce(func.sum(Sale.total_usd), 0).label("sum_usd"),
            func.count(Sale.sale_id).label("total_orders"),
        )
        .filter(
            Sale.user_id == current_user.user_id,
            Sale.sale_date == query_date,
        )
        .first()
    )

    sum_khr = float(result.sum_khr)
    sum_usd = float(result.sum_usd)

    # Convert dual currencies into total combined KHR and USD values
    combined_khr = sum_khr + (sum_usd * EXCHANGE_RATE)
    combined_usd = sum_usd + (sum_khr / EXCHANGE_RATE)

    return {
        "date": query_date.strftime("%d-%b-%Y"),
        "total_revenue_khr": combined_khr,
        "exchange_rate": EXCHANGE_RATE,
        "total_revenue_usd": round(combined_usd, 2),
        "total_orders": result.total_orders,
    }


@router.get("/recent-transactions", response_model=List[RecentTransactionOut])
def get_recent_transactions(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sales = (
        db.query(Sale)
        .filter(Sale.user_id == current_user.user_id)
        .order_by(Sale.sale_date.desc(), Sale.sale_id.desc())
        .limit(limit)
        .all()
    )

    recent_list = []
    for sale in sales:
        # Build description list (e.g., "matcha latte x2, ice latte x4")
        items_summary = (
            ", ".join([f"{item.description} x{item.quantity}" for item in sale.items])
            if sale.items
            else "General Sale"
        )

        # Total transaction amount converted to KHR for standard UI display
        sale_khr_total = float(sale.total_khr) + (float(sale.total_usd) * EXCHANGE_RATE)

        recent_list.append(
            {
                "sale_id": sale.sale_id,
                "summary_text": items_summary,
                "entry_type": getattr(sale, "entry_type", "manual"),
                "formatted_time": sale.sale_date.strftime("%d-%b-%Y"),
                "total_khr": sale_khr_total,
            }
        )

    return recent_list
