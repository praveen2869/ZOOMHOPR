"""
Shared pytest fixtures for ZoomHopr API tests.
All HTTP calls are intercepted by the `responses` library — no live server needed.
"""

import pytest
import responses as resp_lib

# ─────────────────────────────────────────────────────────────────
# Base URLs matching your Spring Boot service ports
# ─────────────────────────────────────────────────────────────────
AUTH_BASE    = "http://localhost:8081/api/auth"
VEHICLE_BASE = "http://localhost:8082/api/vehicles"
BOOKING_BASE = "http://localhost:8083/api/bookings"
USER_BASE    = "http://localhost:8084/api/users"
GATEWAY_BASE = "http://localhost:8080"


# ─────────────────────────────────────────────────────────────────
# Fixture: activate responses mock for every test automatically
# ─────────────────────────────────────────────────────────────────
@pytest.fixture(autouse=True)
def mock_http():
    """Intercept all HTTP requests so tests run without a live server."""
    with resp_lib.RequestsMock(assert_all_requests_are_fired=False) as rsps:
        yield rsps


# ─────────────────────────────────────────────────────────────────
# Fixture: valid JWT token payload
# ─────────────────────────────────────────────────────────────────
@pytest.fixture
def valid_auth_response():
    return {
        "token": "eyJhbGciOiJIUzI1NiJ9.test.signature",
        "refreshToken": "refresh-token-xyz",
        "userId": "user-001",
        "email": "test@zoomhopr.com",
        "role": "CUSTOMER",
    }


# ─────────────────────────────────────────────────────────────────
# Fixture: sample vehicle payload
# ─────────────────────────────────────────────────────────────────
@pytest.fixture
def sample_vehicle():
    return {
        "id": "veh-001",
        "make": "Toyota",
        "model": "Innova",
        "year": 2022,
        "city": "Bangalore",
        "fuelType": "PETROL",
        "transmission": "AUTOMATIC",
        "hourlyRate": 150.0,
        "dailyRate": 1200.0,
        "status": "AVAILABLE",
        "ownerId": "owner-001",
    }


# ─────────────────────────────────────────────────────────────────
# Fixture: sample booking payload
# ─────────────────────────────────────────────────────────────────
@pytest.fixture
def sample_booking():
    return {
        "id": "book-001",
        "vehicleId": "veh-001",
        "userId": "user-001",
        "startTime": "2025-01-01T10:00:00",
        "endTime": "2025-01-01T18:00:00",
        "totalAmount": 1200.0,
        "status": "CONFIRMED",
    }
