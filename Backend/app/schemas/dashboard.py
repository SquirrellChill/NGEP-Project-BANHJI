# app/schemas/dashboard.py
from pydantic import BaseModel
from typing import List


class DashboardSummaryOut(BaseModel):
    date: str
    total_revenue_khr: float
    total_revenue_usd: float
    total_orders: int


class RecentTransactionOut(BaseModel):
    sale_id: int
    summary_text: str
    entry_type: str
    formatted_time: str
    total_khr: float