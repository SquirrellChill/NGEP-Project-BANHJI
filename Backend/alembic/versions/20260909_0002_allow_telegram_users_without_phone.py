"""allow Telegram-only users without phone numbers

Revision ID: 20260909_0002
Revises: 9fa969513bd6
Create Date: 2026-09-09
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260909_0002"
down_revision: Union[str, Sequence[str], None] = "9fa969513bd6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "phone_number",
        existing_type=sa.String(length=20),
        nullable=True,
    )
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=True,
    )
    op.alter_column(
        "users",
        "telegram_id",
        existing_type=sa.Integer(),
        type_=sa.BigInteger(),
        existing_nullable=True,
    )


def downgrade() -> None:
    connection = op.get_bind()
    nullable_accounts = connection.execute(
        sa.text(
            "SELECT COUNT(*) FROM users "
            "WHERE phone_number IS NULL OR password_hash IS NULL"
        )
    ).scalar_one()
    oversized_telegram_ids = connection.execute(
        sa.text(
            "SELECT COUNT(*) FROM users "
            "WHERE telegram_id > 2147483647 OR telegram_id < -2147483648"
        )
    ).scalar_one()

    if nullable_accounts:
        raise RuntimeError(
            "Cannot downgrade while passwordless or phone-less accounts exist."
        )
    if oversized_telegram_ids:
        raise RuntimeError(
            "Cannot downgrade while Telegram IDs exceed the INT range."
        )

    op.alter_column(
        "users",
        "telegram_id",
        existing_type=sa.BigInteger(),
        type_=sa.Integer(),
        existing_nullable=True,
    )
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.alter_column(
        "users",
        "phone_number",
        existing_type=sa.String(length=20),
        nullable=False,
    )
