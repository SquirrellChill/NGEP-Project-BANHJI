import time
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import jwk, jwt

from app.core.config import settings
from app.routers import auth_telegram
from app.schemas.user import TelegramAuthRequest
from app.services.telegram_service import TelegramAuthError, verify_telegram_login


class TelegramLoginVerificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cls.private_pem = cls.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        cls.public_jwk = jwk.construct(
            cls.private_key.public_key(), algorithm="RS256"
        ).to_dict()
        cls.public_jwk["kid"] = "test-key"
        cls.jwks = {"keys": [cls.public_jwk]}

    def setUp(self):
        self.original_client_id = settings.TELEGRAM_CLIENT_ID
        settings.TELEGRAM_CLIENT_ID = "123456789"

    def tearDown(self):
        settings.TELEGRAM_CLIENT_ID = self.original_client_id

    def _token(self, omit=(), **overrides):
        now = int(time.time())
        claims = {
            "iss": "https://oauth.telegram.org",
            "aud": settings.TELEGRAM_CLIENT_ID,
            "sub": "987654321",
            "iat": now,
            "exp": now + 300,
            "name": "Test Seller",
            "given_name": "Test",
        }
        claims.update(overrides)
        for claim in omit:
            claims.pop(claim, None)
        return jwt.encode(
            claims,
            self.private_pem,
            algorithm="RS256",
            headers={"kid": "test-key"},
        )

    def test_accepts_a_valid_telegram_id_token(self):
        claims = verify_telegram_login(self._token(), self.jwks)

        self.assertEqual(claims["sub"], "987654321")
        self.assertEqual(claims["given_name"], "Test")

    def test_rejects_a_token_for_another_client(self):
        with self.assertRaisesRegex(TelegramAuthError, "Invalid or expired"):
            verify_telegram_login(self._token(aud="different-client"), self.jwks)

    def test_rejects_an_expired_token(self):
        with self.assertRaisesRegex(TelegramAuthError, "Invalid or expired"):
            verify_telegram_login(self._token(exp=int(time.time()) - 1), self.jwks)

    def test_rejects_a_missing_subject(self):
        with self.assertRaisesRegex(TelegramAuthError, "invalid subject"):
            verify_telegram_login(self._token(omit={"sub"}), self.jwks)

    def test_rejects_a_non_numeric_subject(self):
        with self.assertRaisesRegex(TelegramAuthError, "invalid subject"):
            verify_telegram_login(self._token(sub="not-a-telegram-id"), self.jwks)

    def test_login_route_uses_verified_subject_as_telegram_id(self):
        db = Mock()
        user = SimpleNamespace(
            user_id=1,
            first_name="Test",
            last_name="Seller",
            email=None,
            phone_number="tg_987654321",
            is_verified=False,
        )
        claims = {"sub": "987654321", "given_name": "Test"}

        with (
            patch.object(auth_telegram, "verify_telegram_login", return_value=claims),
            patch.object(
                auth_telegram.user_repo,
                "find_user_by_telegram_id",
                return_value=user,
            ) as find_user,
            patch.object(auth_telegram, "create_access_token", return_value="test-token"),
        ):
            response = auth_telegram.telegram_login(
                TelegramAuthRequest(id_token="signed-token"), db
            )

        find_user.assert_called_once_with(db, 987654321)
        self.assertEqual(response["data"]["token"], "test-token")


if __name__ == "__main__":
    unittest.main()
