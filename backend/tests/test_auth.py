import unittest
import time
import base64
import json
from backend.services.auth_service import (
    verify_firebase_id_token,
    AuthenticatedUser,
    HTTPException
)
from backend.services.analysis_service import AnalysisService

class TestFirebaseAuthAndProtection(unittest.TestCase):
    def setUp(self):
        self.service = AnalysisService()

    def test_missing_auth_header_raises_401(self):
        with self.assertRaises(HTTPException) as ctx:
            verify_firebase_id_token(None)
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Authorization header is missing", ctx.exception.detail)

    def test_malformed_auth_header_raises_401(self):
        with self.assertRaises(HTTPException) as ctx:
            verify_firebase_id_token("Basic dXNlcjpwYXNz")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Malformed Authorization header", ctx.exception.detail)

    def test_empty_bearer_token_raises_401(self):
        with self.assertRaises(HTTPException) as ctx:
            verify_firebase_id_token("Bearer   ")
        self.assertEqual(ctx.exception.status_code, 401)


    def test_mock_test_token_success(self):
        user = verify_firebase_id_token("Bearer mock-test-token-officer-99")
        self.assertIsInstance(user, AuthenticatedUser)
        self.assertEqual(user.uid, "officer-99")
        self.assertTrue(user.email_verified)

    def test_expired_token_raises_401(self):
        # Construct expired JWT payload
        header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps({
            "sub": "user-expired-123",
            "aud": "brave-cacao-f0z9n",
            "exp": int(time.time()) - 3600  # expired 1 hour ago
        }).encode()).decode().rstrip("=")
        dummy_sig = base64.urlsafe_b64encode(b"dummysig").decode().rstrip("=")
        expired_jwt = f"{header}.{payload}.{dummy_sig}"

        with self.assertRaises(HTTPException) as ctx:
            verify_firebase_id_token(f"Bearer {expired_jwt}")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("expired", ctx.exception.detail.lower())

    def test_valid_token_claims_parsing(self):
        # Construct valid active JWT payload
        header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps({
            "sub": "officer-varun-489",
            "aud": "brave-cacao-f0z9n",
            "email": "varunkrishn489@gmail.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600  # valid for 1 hour
        }).encode()).decode().rstrip("=")
        dummy_sig = base64.urlsafe_b64encode(b"dummysig").decode().rstrip("=")
        valid_jwt = f"{header}.{payload}.{dummy_sig}"

        user = verify_firebase_id_token(f"Bearer {valid_jwt}")
        self.assertEqual(user.uid, "officer-varun-489")
        self.assertEqual(user.email, "varunkrishn489@gmail.com")
        self.assertTrue(user.email_verified)

    def test_analysis_service_attaches_user_id(self):
        response = self.service.analyze_text(
            raw_text="Crack in roof pillar and methane reading 1.8%",
            report_name="Seam_4_Inspection",
            source_type="manual_text",
            user_id="officer-varun-489"
        )
        self.assertEqual(response.authenticated_user_id, "officer-varun-489")
        self.assertEqual(response.status, "success")
        self.assertGreaterEqual(response.risk_assessment.risk_score, 15)


if __name__ == "__main__":
    unittest.main()
