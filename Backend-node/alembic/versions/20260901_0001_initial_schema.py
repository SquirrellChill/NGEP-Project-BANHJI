"""initial schema

Revision ID: 20260901_0001
Revises:
Create Date: 2026-09-01
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "20260901_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column(
            "user_id",
            sa.Integer(),
            autoincrement=True,
            nullable=False
        ),
        sa.Column(
            "first_name",
            sa.String(length=100),
            nullable=False
        ),
        sa.Column(
            "last_name",
            sa.String(length=100),
            nullable=False
        ),
        sa.Column(
            "phone_number",
            sa.String(length=20),
            nullable=False
        ),
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=True
        ),
        sa.Column(
            "password_hash",
            sa.String(length=255),
            nullable=False
        ),
        sa.Column(
            "is_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false()
        ),
        sa.Column(
            "email_verification_code",
            sa.String(length=255),
            nullable=True
        ),
        sa.Column(
            "email_verification_expires",
            sa.DateTime(),
            nullable=True
        ),
        sa.Column(
            "email_verification_attempts",
            sa.Integer(),
            nullable=False,
            server_default="0"
        ),
        sa.Column(
            "email_verification_locked_until",
            sa.DateTime(),
            nullable=True
        ),
        sa.Column(
            "password_reset_token",
            sa.String(length=255),
            nullable=True
        ),
        sa.Column(
            "password_reset_expires",
            sa.DateTime(),
            nullable=True
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.func.now(),
            nullable=True
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            server_default=sa.func.now(),
            nullable=True
        ),
        sa.PrimaryKeyConstraint("user_id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("phone_number"),
    )
    op.create_table(
        "sales",
        sa.Column(
            "sale_id",
            sa.Integer(),
            autoincrement=True,
            nullable=False
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "sale_date",
            sa.Date(),
            nullable=False
        ),
        sa.Column(
            "total_khr",
            sa.DECIMAL(precision=15, scale=2),
            nullable=False,
            server_default="0"
        ),
        sa.Column(
            "total_usd",
            sa.DECIMAL(precision=15, scale=2),
            nullable=False,
            server_default="0"
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.func.now(),
            nullable=True
        ),
        sa.CheckConstraint(
            "total_khr >= 0",
            name="chk_sales_total_khr_nonneg"
        ),
        sa.CheckConstraint(
            "total_usd >= 0",
            name="chk_sales_total_usd_nonneg"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.user_id"]
        ),
        sa.PrimaryKeyConstraint("sale_id"),
    )
    op.create_index(
        op.f("ix_sales_user_id"),
        "sales",
        ["user_id"],
        unique=False
    )
    op.create_index(
        op.f("ix_sales_sale_date"),
        "sales",
        ["sale_date"],
        unique=False
    )
    op.create_table(
        "sale_items",
        sa.Column(
            "sale_item_id",
            sa.Integer(),
            autoincrement=True,
            nullable=False
        ),
        sa.Column(
            "sale_id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=False
        ),
        sa.Column(
            "quantity",
            sa.DECIMAL(precision=10, scale=2),
            nullable=False
        ),
        sa.Column(
            "unit_price",
            sa.DECIMAL(precision=12, scale=2),
            nullable=False
        ),
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False
        ),
        sa.Column(
            "amount",
            sa.DECIMAL(precision=12, scale=2),
            nullable=False
        ),
        sa.CheckConstraint(
            "quantity > 0",
            name="chk_sale_items_quantity_positive"
        ),
        sa.CheckConstraint(
            "unit_price >= 0",
            name="chk_sale_items_unit_price_nonneg"
        ),
        sa.CheckConstraint(
            "amount >= 0",
            name="chk_sale_items_amount_nonneg"
        ),
        sa.CheckConstraint(
            "currency IN ('KHR', 'USD')",
            name="chk_sale_items_currency"
        ),
        sa.ForeignKeyConstraint(
            ["sale_id"],
            ["sales.sale_id"],
            ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("sale_item_id"),
    )
    op.create_index(
        op.f("ix_sale_items_sale_id"),
        "sale_items",
        ["sale_id"],
        unique=False
    )
def downgrade() -> None:
    op.drop_index(
        op.f("ix_sale_items_sale_id"),
        table_name="sale_items"
    )
    op.drop_table("sale_items")
    op.drop_index(
        op.f("ix_sales_sale_date"),
        table_name="sales"
    )
    op.drop_index(
        op.f("ix_sales_user_id"),
        table_name="sales"
    )
    op.drop_table("sales")
    op.drop_table("users")