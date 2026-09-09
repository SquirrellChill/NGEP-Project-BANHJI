import time
import unittest

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import jwk, jwt

from app.core.config import settings
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

    def _token(self, **overrides):
        now = int(time.time())
        claims = {
            "iss": "https://oauth.telegram.org",
            "aud": settings.TELEGRAM_CLIENT_ID,
            "sub": "987654321",
            "id": 987654321,
            "iat": now,
            "exp": now + 300,
            "name": "Test Seller",
            "given_name": "Test",
        }
        claims.update(overrides)
        return jwt.encode(
            claims,
            self.private_pem,
            algorithm="RS256",
            headers={"kid": "test-key"},
        )

    def test_accepts_a_valid_telegram_id_token(self):
        claims = verify_telegram_login(self._token(), self.jwks)

        self.assertEqual(claims["id"], 987654321)
        self.assertEqual(claims["given_name"], "Test")

    def test_rejects_a_token_for_another_client(self):
        with self.assertRaisesRegex(TelegramAuthError, "Invalid or expired"):
            verify_telegram_login(self._token(aud="different-client"), self.jwks)

    def test_rejects_an_expired_token(self):
        with self.assertRaisesRegex(TelegramAuthError, "Invalid or expired"):
            verify_telegram_login(self._token(exp=int(time.time()) - 1), self.jwks)

    def test_rejects_a_mismatched_subject(self):
        with self.assertRaisesRegex(TelegramAuthError, "subject does not match"):
            verify_telegram_login(self._token(sub="111222333"), self.jwks)


if __name__ == "__main__":
    unittest.main()
