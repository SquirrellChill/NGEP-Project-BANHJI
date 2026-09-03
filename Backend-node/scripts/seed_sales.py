import sys
from pathlib import Path
from datetime import date

# 1. Update Python's path FIRST
sys.path.append(str(Path(__file__).resolve().parent.parent))

# 2. Import app modules AFTER sys.path is updated
from app.core.database import SessionLocal
from app.models.user import User
from app.models.sale import Sale
from app.models.sale_item import SaleItem


def seed():
    db = SessionLocal()

    try:
        user = db.query(User).first()

        if not user:
            user = User(
                first_name="Nysa",
                last_name="San",
                phone_number="+85597234123",
                email="nysa@example.com",
                password_hash="dummy_hash",
                is_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        sales_data = [
            {
                "sale_date": date(2026, 9, 1),
                "items": [
                    {
                        "description": "matcha latte",
                        "quantity": 2,
                        "unit_price": 2.00,
                        "currency": "USD",
                        "amount": 4.00,
                    },
                    {
                        "description": "ice latte",
                        "quantity": 4,
                        "unit_price": 1.50,
                        "currency": "USD",
                        "amount": 6.00,
                    },
                ],
            },
            {
                "sale_date": date(2026, 9, 2),
                "items": [
                    {
                        "description": "កាហ្វេទឹកកក",
                        "quantity": 2,
                        "unit_price": 4000,
                        "currency": "KHR",
                        "amount": 8000,
                    },
                    {
                        "description": "cake",
                        "quantity": 1,
                        "unit_price": 2.50,
                        "currency": "USD",
                        "amount": 2.50,
                    },
                ],
            },
        ]

        for data in sales_data:
            total_khr = sum(
                item["amount"]
                for item in data["items"]
                if item["currency"] == "KHR"
            )

            total_usd = sum(
                item["amount"]
                for item in data["items"]
                if item["currency"] == "USD"
            )

            sale = Sale(
                user_id=user.user_id,
                sale_date=data["sale_date"],
                total_khr=total_khr,
                total_usd=total_usd,
            )

            db.add(sale)
            db.flush()

            for item in data["items"]:
                sale_item = SaleItem(
                    sale_id=sale.sale_id,
                    **item,
                )
                db.add(sale_item)

        db.commit()
        print("Seed data inserted successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()