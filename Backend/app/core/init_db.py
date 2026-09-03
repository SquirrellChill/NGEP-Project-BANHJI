"""
Local database bootstrap helpers.

For production changes, prefer Alembic migrations. This helper is useful
when starting a fresh local database from the current SQLAlchemy models.
"""

from app.core.database import Base, engine
from app import models  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created from SQLAlchemy metadata.")
