from bakong_khqr import KHQR
from app.core.config import settings


_khqr_client: KHQR | None = None


def get_khqr_client() -> KHQR:
    global _khqr_client

    if _khqr_client is None:
        if not settings.BAKONG_TOKEN:
            raise RuntimeError("BAKONG_TOKEN is not configured")

        _khqr_client = KHQR(settings.BAKONG_TOKEN)

    return _khqr_client


def generate_khqr(
    amount: float,
    currency: str,
    bill_number: str,
) -> dict:
    khqr = get_khqr_client()

    qr_string = khqr.create_qr(
        account_id=settings.BAKONG_ACCOUNT_ID,
        merchant_name=settings.BAKONG_MERCHANT_NAME,
        merchant_city=settings.BAKONG_MERCHANT_CITY,
        amount=amount,
        currency=currency,
        store_label="KotChomnol",
        phone_number=None,
        bill_number=bill_number,
        terminal_label="Subscription",
        static=False,
    )

    if not qr_string:
        raise RuntimeError("Bakong failed to generate KHQR")

    md5_hash = khqr.generate_md5(qr_string)

    if not md5_hash:
        raise RuntimeError("Failed to generate KHQR MD5")

    deeplink = None

    try:
        deeplink = khqr.generate_deeplink(
            qr=qr_string,
            appName=settings.BAKONG_MERCHANT_NAME,
        )
    except Exception:
        deeplink = None

    return {
        "qr_string": qr_string,
        "md5_hash": md5_hash,
        "deeplink": deeplink,
    }


def check_payment_status(md5_hash: str) -> str:
    """
    Check Bakong payment status.

    Important:
    The bakong-khqr package converts every non-zero responseCode
    into 'UNPAID'. We bypass that wrapper so we can detect
    actual Bakong API errors such as rate limits.
    """

    if not md5_hash:
        raise ValueError("Payment MD5 hash is missing")

    khqr = get_khqr_client()

    # Access the SDK's internal request method
    request_method = getattr(
        khqr,
        "_KHQR__post_request",
        None,
    )

    if request_method is None:
        raise RuntimeError(
            "Bakong request method is unavailable"
        )

    response = request_method(
        "/check_transaction_by_md5",
        {
            "md5": md5_hash,
        },
    )

    print("========================================")
    print("BAKONG TRANSACTION CHECK")
    print("MD5:", md5_hash)
    print("RAW BAKONG RESPONSE:")
    print(response)
    print("responseCode:", response.get("responseCode"))
    print("responseMessage:", response.get("responseMessage"))
    print("errorCode:", response.get("errorCode"))
    print("data:", response.get("data"))
    print("========================================")

    response_code = response.get("responseCode")

    # Successful transaction
    if response_code == 0:
        return "PAID"

    # Daily API request limit
    if response.get("errorCode") == 17:
        raise RuntimeError(
            "Bakong API daily request limit exceeded. "
            "Please try again tomorrow."
        )

    # Other Bakong errors
    message = response.get(
        "responseMessage",
        "Unknown Bakong error",
    )

    raise RuntimeError(
        f"Bakong error: {message}"
    )


def get_payment_details(md5_hash: str) -> dict | None:
    if not md5_hash:
        raise ValueError("Payment MD5 hash is missing")

    khqr = get_khqr_client()

    return khqr.get_payment(md5_hash)