from sqlalchemy.orm import Session

from app.models.user import User


def find_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def find_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.user_id == user_id).first()


def find_user_by_reset_token_hash(db: Session, hashed_token: str) -> User | None:
    return db.query(User).filter(User.password_reset_token == hashed_token).first()


def create_user(
    db: Session,
    first_name: str,
    last_name: str,
    phone_number: str,
    email: str,
    password_hash: str,
) -> User:
    user = User(
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        email=email,
        password_hash=password_hash,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
