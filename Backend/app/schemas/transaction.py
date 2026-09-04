"""Request and response shapes for the sales endpoints.

The create shape mirrors what the AI backend returns once the seller confirms,
so the app can post a confirmed record straight through without reshaping it.
"""

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Currency = Literal["KHR", "USD"]
Period = Literal["daily", "weekly", "monthly"]


class SaleItemCreate(BaseModel):
    description: str = Field(min_length=1, max_length=500)
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    currency: Currency

    @field_validator("description")
    @classmethod
    def strip_description(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("description cannot be blank")
        return cleaned


class SaleItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sale_item_id: int
    description: str
    quantity: Decimal
    unit_price: Decimal
    currency: str
    amount: Decimal


class SaleCreate(BaseModel):
    """A confirmed sale, ready to store.

    Totals are deliberately absent — the service computes them from the line
    items so the stored header can never disagree with its own rows.
    """

    sale_date: date
    items: list[SaleItemCreate] = Field(min_length=1)


class SaleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sale_id: int
    sale_date: date
    total_khr: Decimal
    total_usd: Decimal
    items: list[SaleItemRead] = []


class CurrencyTotals(BaseModel):
    """Income in one currency over a period.

    Never combined across currencies. Riel plus dollars needs an exchange rate
    that drifts, and converting at display time would make stored history wrong
    the moment it moves. Sellers here already think in both at once.
    """

    currency: Currency
    total: Decimal = Decimal("0")


class SummaryRead(BaseModel):
    period: Period
    start_date: date
    end_date: date
    sales_count: int
    totals: list[CurrencyTotals]
