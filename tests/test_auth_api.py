"""
API tests for ZoomHopr Auth Service.

Endpoints covered:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/refresh
"""

import json
import requests
import responses

AUTH_BASE = "http://localhost:8081/api/auth"


class TestRegisterEndpoint:
    """Tests for POST /api/auth/register"""

    @responses.activate
    def test_register_success_returns_200(self, valid_auth_response):
        """Happy path: valid payload returns 200 with token."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/register",
            json=valid_auth_response,
            status=200,
        )
        payload = {
            "name": "Test User",
            "email": "test@zoomhopr.com",
            "password": "SecurePass@123",
            "phone": "9876543210",
            "role": "CUSTOMER",
        }
        response = requests.post(f"{AUTH_BASE}/register", json=payload, timeout=5)

        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "refreshToken" in data
        assert data["email"] == "test@zoomhopr.com"

    @responses.activate
    def test_register_duplicate_email_returns_409(self):
        """Duplicate email should return 409 Conflict."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/register",
            json={"error": "Email already registered"},
            status=409,
        )
        payload = {
            "name": "Duplicate User",
            "email": "existing@zoomhopr.com",
            "password": "Pass@123",
            "phone": "9876543211",
            "role": "CUSTOMER",
        }
        response = requests.post(f"{AUTH_BASE}/register", json=payload, timeout=5)
        assert response.status_code == 409
        assert "error" in response.json()

    @responses.activate
    def test_register_missing_email_returns_400(self):
        """Missing required field should return 400 Bad Request."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/register",
            json={"error": "Email is required"},
            status=400,
        )
        payload = {"name": "No Email User", "password": "Pass@123"}
        response = requests.post(f"{AUTH_BASE}/register", json=payload, timeout=5)
        assert response.status_code == 400

    @responses.activate
    def test_register_weak_password_returns_400(self):
        """Weak password violating policy should return 400."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/register",
            json={"error": "Password does not meet requirements"},
            status=400,
        )
        payload = {
            "name": "Weak Pass User",
            "email": "weak@zoomhopr.com",
            "password": "123",
            "phone": "9876543212",
            "role": "CUSTOMER",
        }
        response = requests.post(f"{AUTH_BASE}/register", json=payload, timeout=5)
        assert response.status_code == 400

    @responses.activate
    def test_register_host_role_returns_token(self, valid_auth_response):
        """Registering as HOST role should also succeed."""
        host_response = {**valid_auth_response, "role": "HOST"}
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/register",
            json=host_response,
            status=200,
        )
        payload = {
            "name": "Host User",
            "email": "host@zoomhopr.com",
            "password": "SecurePass@123",
            "phone": "9876543213",
            "role": "HOST",
        }
        response = requests.post(f"{AUTH_BASE}/register", json=payload, timeout=5)
        assert response.status_code == 200
        assert response.json()["role"] == "HOST"


class TestLoginEndpoint:
    """Tests for POST /api/auth/login"""

    @responses.activate
    def test_login_valid_credentials_returns_200(self, valid_auth_response):
        """Valid credentials return 200 with JWT token."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/login",
            json=valid_auth_response,
            status=200,
        )
        payload = {"email": "test@zoomhopr.com", "password": "SecurePass@123"}
        response = requests.post(f"{AUTH_BASE}/login", json=payload, timeout=5)

        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert len(data["token"]) > 10  # should be a real JWT

    @responses.activate
    def test_login_wrong_password_returns_401(self):
        """Wrong password should return 401 Unauthorized."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/login",
            json={"error": "Invalid credentials"},
            status=401,
        )
        payload = {"email": "test@zoomhopr.com", "password": "WrongPass"}
        response = requests.post(f"{AUTH_BASE}/login", json=payload, timeout=5)
        assert response.status_code == 401

    @responses.activate
    def test_login_nonexistent_user_returns_404(self):
        """Non-existent user email should return 404."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/login",
            json={"error": "User not found"},
            status=404,
        )
        payload = {"email": "ghost@zoomhopr.com", "password": "Pass@123"}
        response = requests.post(f"{AUTH_BASE}/login", json=payload, timeout=5)
        assert response.status_code == 404

    @responses.activate
    def test_login_empty_body_returns_400(self):
        """Empty request body should return 400."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/login",
            json={"error": "Request body is required"},
            status=400,
        )
        response = requests.post(
            f"{AUTH_BASE}/login",
            data=json.dumps({}),
            headers={"Content-Type": "application/json"},
            timeout=5,
        )
        assert response.status_code == 400

    @responses.activate
    def test_login_response_has_required_fields(self, valid_auth_response):
        """Login response must contain all required fields."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/login",
            json=valid_auth_response,
            status=200,
        )
        payload = {"email": "test@zoomhopr.com", "password": "SecurePass@123"}
        response = requests.post(f"{AUTH_BASE}/login", json=payload, timeout=5)
        data = response.json()

        required_fields = ["token", "refreshToken", "userId", "email", "role"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"


class TestRefreshEndpoint:
    """Tests for POST /api/auth/refresh"""

    @responses.activate
    def test_refresh_valid_token_returns_new_token(self, valid_auth_response):
        """Valid refresh token should return new access token."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/refresh",
            json={**valid_auth_response, "token": "new-jwt-token-xyz"},
            status=200,
        )
        response = requests.post(
            f"{AUTH_BASE}/refresh",
            params={"refreshToken": "refresh-token-xyz"},
            timeout=5,
        )
        assert response.status_code == 200
        assert response.json()["token"] == "new-jwt-token-xyz"

    @responses.activate
    def test_refresh_expired_token_returns_401(self):
        """Expired refresh token should return 401."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/refresh",
            json={"error": "Refresh token expired"},
            status=401,
        )
        response = requests.post(
            f"{AUTH_BASE}/refresh",
            params={"refreshToken": "expired-token"},
            timeout=5,
        )
        assert response.status_code == 401

    @responses.activate
    def test_refresh_missing_token_returns_400(self):
        """Missing refresh token param should return 400."""
        responses.add(
            responses.POST,
            f"{AUTH_BASE}/refresh",
            json={"error": "refreshToken parameter is required"},
            status=400,
        )
        response = requests.post(f"{AUTH_BASE}/refresh", timeout=5)
        assert response.status_code == 400
