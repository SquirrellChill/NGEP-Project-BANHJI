from sqlalchemy import Column, Integer, String, Boolean, DateTime, TIMESTAMP, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False, unique=True)
    email = Column(String(255), nullable=True, unique=True)
    password_hash = Column(String(255), nullable=False)

    # email verification
    is_verified = Column(Boolean, nullable=False, default=False)
    email_verification_code = Column(String(255), nullable=True)
    email_verification_expires = Column(DateTime, nullable=True)
    email_verification_attempts = Column(Integer, nullable=False, default=0)
    email_verification_locked_until = Column(DateTime, nullable=True)

    # Telegram login
    telegram_id = Column(Integer, nullable=True, unique=True)
    telegram_username = Column(String(255), nullable=True)

    # password reset
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=True)
    updated_at = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=True
    )
    
    

    sales = relationship("Sale", back_populates="user", cascade="all, delete-orphan")
