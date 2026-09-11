"""
models/payment.py

Corrected to match the existing User model, whose primary key is
`user_id` (Integer, autoincrement) — not `id` (UUID). Only the
`user_id` FK columns on Payment and Subscription changed:
  - type: CHAR(36) -> Integer
  - target: "users.id" -> "users.user_id"

Everything else (UUID primary keys on payments.id / subscriptions.id,
enums, relationships) is unchanged.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Numeric, DateTime, Enum, ForeignKey, Text, func
)
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship

from app.core.database import Base  # adjust to your project's Base import


def gen_uuid() -> str:
    return str(uuid.uuid4())


class PlanType(str, enum.Enum):
    growth = "growth"
    business = "business"


class PaymentProvider(str, enum.Enum):
    bakong = "bakong"
    aba_payway = "aba_payway"


class PaymentStatus(str, enum.Enum):
    pending = "pending"      # QR generated, waiting for user to pay
    paid = "paid"            # confirmed paid via Bakong check_payment
    expired = "expired"      # QR expired before payment was detected
    failed = "failed"        # provider error / cancelled


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"


class Payment(Base):
    """One row per payment attempt (one QR code = one Payment row)."""
    __tablename__ = "payments"

    id = Column(CHAR(36), primary_key=True, default=gen_uuid)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)

    plan = Column(Enum(PlanType), nullable=False)
    provider = Column(Enum(PaymentProvider), nullable=False, default=PaymentProvider.bakong)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.pending, index=True)

    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")

    # Bakong-specific fields
    qr_string = Column(Text, nullable=True)        # raw KHQR EMV string returned to frontend to render as QR image
    md5_hash = Column(String(32), nullable=True, index=True)   # used to poll Bakong's check_payment(md5)
    deeplink = Column(Text, nullable=True)          # Bakong app deeplink (for mobile "open Bakong app" button)
    external_ref = Column(String(64), nullable=True)  # Bakong's transaction reference once paid

    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=False)
    paid_at = Column(DateTime, nullable=True)

    user = relationship("User", backref="payments")

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


class Subscription(Base):
    """Current subscription state per user — one active row, updated on each successful payment."""
    __tablename__ = "subscriptions"

    id = Column(CHAR(36), primary_key=True, default=gen_uuid)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, unique=True, index=True)

    plan = Column(Enum(PlanType), nullable=False)
    status = Column(Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.active)

    current_period_start = Column(DateTime, nullable=False, default=datetime.utcnow)
    current_period_end = Column(DateTime, nullable=False)

    last_payment_id = Column(CHAR(36), ForeignKey("payments.id"), nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="subscription", uselist=False)

    def is_active(self) -> bool:
        return self.status == SubscriptionStatus.active and datetime.utcnow() < self.current_period_end