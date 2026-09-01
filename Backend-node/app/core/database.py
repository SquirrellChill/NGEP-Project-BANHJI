"""
SQLAlchemy engine + session setup.

This mirrors what Sequelize's `sequelize.js` config file would do in a
Node.js project, but on the FastAPI/Python side: create one Engine,
one sessionmaker, and a declarative Base that all models inherit from.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# pool_pre_ping=True avoids "MySQL server has gone away" errors on
# long-lived connections (same idea as Sequelize's `pool` options).
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()