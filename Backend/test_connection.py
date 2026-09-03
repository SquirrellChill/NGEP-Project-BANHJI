"""

Run from inside Backend-node/:
    python test_connection.py
"""

from sqlalchemy import text
from app.core.database import engine
from app.core.config import settings


def main():
    print(f"Connecting to: {settings.DATABASE_URL}")

    try:
        with engine.connect() as conn:
            print("Connected to MySQL successfully.\n")

            # Check which tables exist in the current database
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]

            expected = {"users", "sales", "sale_items"}
            found = set(tables)

            print(f"Tables found: {tables if tables else '(none)'}")

            missing = expected - found
            if missing:
                print(f"\nMissing expected tables: {missing}")
                print("   Did you run sql/schema.sql against this database yet?")
            else:
                print("\nAll expected tables (users, sales, sale_items) are present.")

    except Exception as e:
        print(" Connection failed.")
        print(f"   Error: {e}")
        print("\nCommon causes:")
        print("  - Wrong password in .env")
        print("  - MySQL server not running")
        print("  - Database name in .env doesn't exist yet")


if __name__ == "__main__":
    main()