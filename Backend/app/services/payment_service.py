import asyncio
import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.payment import (
    Payment,
    PaymentStatus,
    PlanType,
    Subscription,
    SubscriptionStatus,
)
from app.schemas.payment import PLAN_PRICES_USD
from app.services import bakong_service


logger = logging.getLogger(__name__)


# ============================================================
# CREATE PAYMENT
# ============================================================

def create_payment(
    db: Session,
    user_id: int,
    plan: PlanType,
) -> Payment:
    """
    Create a pending payment and generate its KHQR.
    """

    amount = PLAN_PRICES_USD[plan]
    currency = settings.KHQR_CURRENCY

    payment = Payment(
        user_id=user_id,
        plan=plan,
        amount=amount,
        currency=currency,
        status=PaymentStatus.pending,
        expires_at=(
            datetime.utcnow()
            + timedelta(
                minutes=settings.KHQR_EXPIRE_MINUTES
            )
        ),
    )

    db.add(payment)
    db.flush()

    try:
        # -----------------------------------------------------
        # Generate KHQR
        # -----------------------------------------------------

        khqr_data = bakong_service.generate_khqr(
            amount=amount,
            currency=currency,
            bill_number=payment.id.replace(
                "-",
                "",
            )[:25],
        )

        # -----------------------------------------------------
        # Store KHQR information
        # -----------------------------------------------------

        payment.qr_string = khqr_data["qr_string"]

        payment.md5_hash = khqr_data["md5_hash"]

        payment.deeplink = khqr_data.get(
            "deeplink"
        )

        db.commit()
        db.refresh(payment)

        logger.info(
            "KHQR payment created: %s",
            payment.id,
        )

        return payment

    except Exception:
        db.rollback()

        logger.exception(
            "Failed to generate KHQR"
        )

        raise


# ============================================================
# ACTIVATE SUBSCRIPTION
# ============================================================

def activate_subscription(
    db: Session,
    payment: Payment,
):
    """
    Create or renew a 30-day subscription.
    """

    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == payment.user_id
        )
        .first()
    )

    now = datetime.utcnow()

    if subscription is None:

        subscription = Subscription(
            user_id=payment.user_id,
            plan=payment.plan,
            status=SubscriptionStatus.active,
            current_period_end=(
                now + timedelta(days=30)
            ),
        )

        db.add(subscription)

    else:

        # If current subscription is still active,
        # extend it from the existing end date.
        if (
            subscription.status
            == SubscriptionStatus.active
            and subscription.current_period_end
            and subscription.current_period_end > now
        ):
            start_date = subscription.current_period_end

        else:
            start_date = now

        subscription.plan = payment.plan
        subscription.status = SubscriptionStatus.active

        subscription.current_period_end = (
            start_date
            + timedelta(days=30)
        )

    return subscription


# ============================================================
# MARK PAYMENT AS PAID
# ============================================================

def mark_paid(
    db: Session,
    payment: Payment,
    external_ref: str | None = None,
):
    """
    Mark payment as paid and activate subscription.
    """

    if payment.status == PaymentStatus.paid:
        return

    payment.status = PaymentStatus.paid
    payment.paid_at = datetime.utcnow()
    payment.external_ref = external_ref

    activate_subscription(
        db,
        payment,
    )

    db.commit()

    logger.info(
        "Payment marked as PAID: %s",
        payment.id,
    )


# ============================================================
# MARK PAYMENT AS EXPIRED
# ============================================================

def mark_expired(
    db: Session,
    payment: Payment,
):
    """
    Mark a pending payment as expired.
    """

    if payment.status != PaymentStatus.pending:
        return

    payment.status = PaymentStatus.expired

    db.commit()

    logger.info(
        "Payment expired: %s",
        payment.id,
    )


# ============================================================
# VERIFY PAYMENT DETAILS
# ============================================================

def verify_payment_details(
    payment: Payment,
    details: dict,
) -> bool:
    """
    Verify important information returned by Bakong.
    """

    if not details:
        return False

    # ---------------------------------------------------------
    # Extract amount
    # ---------------------------------------------------------

    amount = (
        details.get("amount")
        or details.get("totalAmount")
        or details.get("total_amount")
    )

    # ---------------------------------------------------------
    # Extract currency
    # ---------------------------------------------------------

    currency = (
        details.get("currency")
        or details.get("currencyCode")
    )

    # ---------------------------------------------------------
    # Extract external reference
    # ---------------------------------------------------------

    external_ref = (
        details.get("externalRef")
        or details.get("external_ref")
        or details.get("transactionId")
        or details.get("transaction_id")
    )

    logger.info(
        "Payment verification - payment=%s amount=%s currency=%s external_ref=%s",
        payment.id,
        amount,
        currency,
        external_ref,
    )

    # ---------------------------------------------------------
    # Verify amount
    # ---------------------------------------------------------

    if amount is not None:

        try:
            received_amount = float(amount)
            expected_amount = float(payment.amount)

            if abs(
                received_amount - expected_amount
            ) > 0.001:

                logger.error(
                    "Payment amount mismatch: expected=%s received=%s",
                    expected_amount,
                    received_amount,
                )

                return False

        except (TypeError, ValueError):

            logger.error(
                "Invalid payment amount: %s",
                amount,
            )

            return False

    # ---------------------------------------------------------
    # Verify currency
    # ---------------------------------------------------------

    if currency is not None:

        if (
            str(currency).upper()
            != str(payment.currency).upper()
        ):

            logger.error(
                "Payment currency mismatch: expected=%s received=%s",
                payment.currency,
                currency,
            )

            return False

    return True


# ============================================================
# BACKGROUND PAYMENT POLLING
# ============================================================

async def poll_payment_until_resolved(
    payment_id: str,
):
    """
    Continuously check Bakong until the payment is:

    - PAID
    - EXPIRED
    - FAILED
    """

    db = SessionLocal()

    try:

        payment = (
            db.query(Payment)
            .filter(
                Payment.id == payment_id
            )
            .first()
        )

        if payment is None:
            logger.error(
                "Payment not found: %s",
                payment_id,
            )
            return

        while True:

            # Refresh payment from database
            db.refresh(payment)

            # -------------------------------------------------
            # Stop if payment already resolved
            # -------------------------------------------------

            if (
                payment.status
                != PaymentStatus.pending
            ):
                return

            # -------------------------------------------------
            # Check expiry
            # -------------------------------------------------

            if (
                payment.expires_at
                and datetime.utcnow()
                > payment.expires_at
            ):

                mark_expired(
                    db,
                    payment,
                )

                return

            # -------------------------------------------------
            # Check Bakong
            # -------------------------------------------------

            try:

                status = (
                    bakong_service
                    .check_payment_status(
                        payment.md5_hash
                    )
                )

                logger.info(
                    "Bakong status for %s: %s",
                    payment.id,
                    status,
                )

            except Exception:

                logger.exception(
                    "Bakong status check failed: %s",
                    payment.id,
                )

                await asyncio.sleep(
                    settings.KHQR_POLL_INTERVAL_SECONDS
                )

                continue

            # -------------------------------------------------
            # Payment successful
            # -------------------------------------------------

            if (
                str(status)
                .strip()
                .upper()
                == "PAID"
            ):

                try:

                    details = (
                        bakong_service
                        .get_payment_details(
                            payment.md5_hash
                        )
                    )

                    if not details:

                        logger.error(
                            "Bakong returned no details: %s",
                            payment.id,
                        )

                        payment.status = (
                            PaymentStatus.failed
                        )

                        db.commit()

                        return

                    # -----------------------------------------
                    # Verify transaction
                    # -----------------------------------------

                    if not verify_payment_details(
                        payment,
                        details,
                    ):

                        logger.error(
                            "Payment verification failed: %s",
                            payment.id,
                        )

                        payment.status = (
                            PaymentStatus.failed
                        )

                        db.commit()

                        return

                    # -----------------------------------------
                    # External reference
                    # -----------------------------------------

                    external_ref = (
                        details.get("externalRef")
                        or details.get("external_ref")
                        or details.get("transactionId")
                        or details.get("transaction_id")
                    )

                    # -----------------------------------------
                    # Mark paid
                    # -----------------------------------------

                    mark_paid(
                        db,
                        payment,
                        external_ref=external_ref,
                    )

                    logger.info(
                        "Payment completed: %s",
                        payment.id,
                    )

                    return

                except Exception:

                    db.rollback()

                    logger.exception(
                        "Failed processing paid payment: %s",
                        payment.id,
                    )

                    return

            # -------------------------------------------------
            # Payment still pending
            # -------------------------------------------------

            await asyncio.sleep(
                settings.KHQR_POLL_INTERVAL_SECONDS
            )

    except Exception:

        db.rollback()

        logger.exception(
            "Payment polling failed: %s",
            payment_id,
        )

    finally:

        db.close()


# ============================================================
# GET PAYMENT
# ============================================================

def get_payment(
    db: Session,
    payment_id: str,
    user_id: int,
):
    """
    Get a payment belonging to the current user.
    """

    return (
        db.query(Payment)
        .filter(
            Payment.id == payment_id,
            Payment.user_id == user_id,
        )
        .first()
    )


# ============================================================
# GET ACTIVE SUBSCRIPTION
# ============================================================

def get_active_subscription(
    db: Session,
    user_id: int,
):
    """
    Get the current user's active subscription.
    """

    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id
        )
        .first()
    )

    if subscription is None:
        return None

    # ---------------------------------------------------------
    # Automatically expire old subscription
    # ---------------------------------------------------------

    if (
        subscription.status
        == SubscriptionStatus.active
        and subscription.current_period_end
        and datetime.utcnow()
        > subscription.current_period_end
    ):

        subscription.status = (
            SubscriptionStatus.expired
        )

        db.commit()

        return None

    if (
        subscription.status
        != SubscriptionStatus.active
    ):
        return None

    return subscription