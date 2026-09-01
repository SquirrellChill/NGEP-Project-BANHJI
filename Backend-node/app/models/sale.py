from sqlalchemy import Column, Integer, ForeignKey, Date, DECIMAL, TIMESTAMP, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"

    sale_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    sale_date = Column(Date, nullable=False)
    total_amount = Column(DECIMAL(12, 2), nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=True)

    user = relationship("User", back_populates="sales")
    items = relationship(
        "SaleItem", back_populates="sale", cascade="all, delete-orphan"
    )