from sqlalchemy import Column, Integer, ForeignKey, Text, DECIMAL, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class SaleItem(Base):
    __tablename__ = "sale_items"

    sale_item_id = Column(Integer, primary_key=True, autoincrement=True)
    sale_id = Column(
        Integer, ForeignKey("sales.sale_id", ondelete="CASCADE"), nullable=False, index=True
    )
    description = Column(Text, nullable=False)
    quantity = Column(DECIMAL(10, 2), nullable=False)
    unit_price = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")