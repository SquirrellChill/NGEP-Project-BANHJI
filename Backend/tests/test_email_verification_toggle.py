import os
import unittest
from unittest.mock import Mock

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core import config
from app.core.database import Base, get_db
from app.main import app
from app.models import user  # noqa: F401
from app.routers import auth


engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


class EmailVerificationToggleTests(unittest.TestCase):
    def setUp(self):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        self.original_required = config.settings.REQUIRE_EMAIL_VERIFICATION
        self.original_sender = auth.send_verification_email
        auth.send_verification_email = Mock()

    def tearDown(self):
        config.settings.REQUIRE_EMAIL_VERIFICATION = self.original_required
        auth.settings.REQUIRE_EMAIL_VERIFICATION = self.original_required
        auth.send_verification_email = self.original_sender

    def _register_payload(self, email="seller@example.com"):
        return {
            "first_name": "Sok",
            "last_name": "Bora",
            "phone_number": "+85512345678",
            "email": email,
            "password": "password123",
        }

    def test_registration_requires_verification_by_default(self):
        config.settings.REQUIRE_EMAIL_VERIFICATION = True
        auth.settings.REQUIRE_EMAIL_VERIFICATION = True

        response = client.post("/auth/register", json=self._register_payload())

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["data"]["requires_email_verification"])
        auth.send_verification_email.assert_called_once()

        login_response = client.post(
            "/auth/login",
            json={"email": "seller@example.com", "password": "password123"},
        )
        self.assertEqual(login_response.status_code, 403)

    def test_registration_can_skip_email_verification_when_disabled(self):
        config.settings.REQUIRE_EMAIL_VERIFICATION = False
        auth.settings.REQUIRE_EMAIL_VERIFICATION = False

        response = client.post("/auth/register", json=self._register_payload())

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["data"]["requires_email_verification"])
        auth.send_verification_email.assert_not_called()

        login_response = client.post(
            "/auth/login",
            json={"email": "seller@example.com", "password": "password123"},
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertIn("token", login_response.json()["data"])
        self.assertFalse(login_response.json()["data"]["user"]["is_verified"])

    def test_resend_does_not_send_when_verification_disabled(self):
        config.settings.REQUIRE_EMAIL_VERIFICATION = False
        auth.settings.REQUIRE_EMAIL_VERIFICATION = False

        register_response = client.post("/auth/register", json=self._register_payload())
        self.assertEqual(register_response.status_code, 200)
        auth.send_verification_email.reset_mock()

        resend_response = client.post(
            "/auth/resend-verification",
            json={"email": "seller@example.com"},
        )

        self.assertEqual(resend_response.status_code, 200)
        auth.send_verification_email.assert_not_called()


if __name__ == "__main__":
    unittest.main()