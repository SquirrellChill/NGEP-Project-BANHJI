"""
Import all models here so that Base.metadata knows about every table
(needed for Alembic autogenerate and for Base.metadata.create_all()).
"""

from app.core.database import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.sale import Sale  # noqa: F401
from app.models.sale_item import SaleItem  # noqa: F401