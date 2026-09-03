import enum
from sqlalchemy import Column, Integer, ForeignKey, Date, DECIMAL, TIMESTAMP, func
from sqlalchemy.orm import relationship

from app.core.database import Base

class EntryType(str, enum.Enum):
    VOICE = "voice"
    MANUAL = "manual"

class Sale(Base):
    __tablename__ = "sales"

    sale_id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(
        Integer, 
        ForeignKey("users.user_id"), 
        nullable=False, 
        index=True
    )
    sale_date = Column(Date, nullable=False, index=True)
    total_khr = Column(DECIMAL(15, 2), nullable=False, default=0)
    total_usd = Column(DECIMAL(15, 2), nullable=False, default=0)

    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=True)

    user = relationship(
        "User", 
        back_populates="sales")
    
    items = relationship(
        "SaleItem", 
        back_populates="sale", 
        cascade="all, delete-orphan"
    )