import unittest

from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.models.user import User
from app.repositories import user_repository as user_repo


class TelegramUserCreationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite+pysqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        Base.metadata.drop_all(self.engine)
        Base.metadata.create_all(self.engine)
        self.db = self.Session()

    def tearDown(self):
        self.db.close()

    def test_creates_telegram_user_without_phone_or_password(self):
        user = user_repo.create_user_telegram(
            self.db,
            telegram_id=987654321012345678,
            telegram_username="seller",
            first_name="Test",
            last_name="Seller",
        )

        self.assertIsNone(user.phone_number)
        self.assertIsNone(user.password_hash)
        self.assertEqual(user.telegram_id, 987654321012345678)

    def test_allows_multiple_telegram_users_with_null_phone_numbers(self):
        first = user_repo.create_user_telegram(
            self.db, 111222333, "first", "First", "Seller"
        )
        second = user_repo.create_user_telegram(
            self.db, 444555666, "second", "Second", "Seller"
        )

        self.assertIsNone(first.phone_number)
        self.assertIsNone(second.phone_number)
        self.assertEqual(self.db.query(User).count(), 2)

    def test_does_not_merge_with_existing_user_by_profile_fields(self):
        existing = user_repo.create_user(
            self.db,
            first_name="Test",
            last_name="Seller",
            phone_number="+85512345678",
            email="seller@example.com",
            password_hash="hashed-password",
        )

        telegram_user = user_repo.create_user_telegram(
            self.db,
            telegram_id=987654321,
            telegram_username="seller",
            first_name="Test",
            last_name="Seller",
        )

        self.assertNotEqual(existing.user_id, telegram_user.user_id)
        self.assertEqual(existing.phone_number, "+85512345678")
        self.assertEqual(self.db.query(User).count(), 2)

    def test_rejects_duplicate_real_phone_numbers(self):
        user_repo.create_user(
            self.db,
            first_name="First",
            last_name="Seller",
            phone_number="+85512345678",
            email="first@example.com",
            password_hash="hashed-password",
        )

        with self.assertRaises(IntegrityError):
            user_repo.create_user(
                self.db,
                first_name="Second",
                last_name="Seller",
                phone_number="+85512345678",
                email="second@example.com",
                password_hash="hashed-password",
            )
        self.db.rollback()

    def test_rejects_duplicate_telegram_identities(self):
        user_repo.create_user_telegram(
            self.db,
            telegram_id=987654321,
            telegram_username="first",
            first_name="First",
            last_name="Seller",
        )

        with self.assertRaises(IntegrityError):
            user_repo.create_user_telegram(
                self.db,
                telegram_id=987654321,
                telegram_username="second",
                first_name="Second",
                last_name="Seller",
            )
        self.db.rollback()


if __name__ == "__main__":
    unittest.main()
