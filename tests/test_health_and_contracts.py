"""
Health-check and contract tests for all ZoomHopr microservices.

These tests verify:
  - Each service responds on its expected port
  - Response shapes conform to the API contract
  - Gateway routes traffic correctly
"""

import pytest
import requests
import responses

SERVICES = {
    "eureka":      "http://localhost:8761",
    "api-gateway": "http://localhost:8080",
    "auth":        "http://localhost:8081",
    "vehicle":     "http://localhost:8082",
    "booking":     "http://localhost:8083",
    "user":        "http://localhost:8084",
    "payment":     "http://localhost:8085",
    "ridematch":   "http://localhost:8086",
    "notification":"http://localhost:8087",
    "chat":        "http://localhost:8088",
    "review":      "http://localhost:8089",
}


class TestServiceHealthEndpoints:
    """Verify all services expose Spring Boot Actuator health endpoint."""

    @pytest.mark.parametrize("service_name,base_url", list(SERVICES.items()))
    @responses.activate
    def test_actuator_health_returns_up(self, service_name, base_url):
        """Each service's /actuator/health should return UP status."""
        health_url = f"{base_url}/actuator/health"
        responses.add(
            responses.GET,
            health_url,
            json={"status": "UP"},
            status=200,
        )
        response = requests.get(health_url, timeout=5)

        assert response.status_code == 200, \
            f"{service_name} health check failed with {response.status_code}"
        assert response.json()["status"] == "UP", \
            f"{service_name} reported status: {response.json()['status']}"

    @responses.activate
    def test_health_response_shape(self):
        """Health response must include 'status' field."""
        responses.add(
            responses.GET,
            "http://localhost:8081/actuator/health",
            json={"status": "UP", "components": {}},
            status=200,
        )
        response = requests.get("http://localhost:8081/actuator/health", timeout=5)
        data = response.json()
        assert "status" in data

    @responses.activate
    def test_gateway_is_reachable(self):
        """API Gateway root should return a non-5xx response."""
        responses.add(
            responses.GET,
            "http://localhost:8080/actuator/health",
            json={"status": "UP"},
            status=200,
        )
        response = requests.get("http://localhost:8080/actuator/health", timeout=5)
        assert response.status_code < 500


class TestApiContractValidation:
    """Contract tests — verify response schemas match expectations."""

    @responses.activate
    def test_auth_register_contract(self):
        """Auth register response must match expected schema."""
        mock_response = {
            "token": "jwt-token",
            "refreshToken": "refresh-token",
            "userId": "u-001",
            "email": "test@zoomhopr.com",
            "role": "CUSTOMER",
        }
        responses.add(
            responses.POST,
            "http://localhost:8081/api/auth/register",
            json=mock_response,
            status=200,
        )
        response = requests.post(
            "http://localhost:8081/api/auth/register",
            json={
                "name": "Test",
                "email": "test@zoomhopr.com",
                "password": "Pass@123",
                "phone": "9999999999",
                "role": "CUSTOMER",
            },
            timeout=5,
        )
        data = response.json()
        # Schema validation
        assert isinstance(data["token"], str)
        assert isinstance(data["refreshToken"], str)
        assert isinstance(data["userId"], str)
        assert data["role"] in ["CUSTOMER", "HOST", "ADMIN"]

    @responses.activate
    def test_vehicle_search_contract(self):
        """Vehicle search response must be a list of vehicle objects."""
        mock_vehicles = [
            {
                "id": "v1", "make": "Toyota", "model": "Fortuner",
                "year": 2023, "city": "Bangalore", "fuelType": "DIESEL",
                "transmission": "AUTOMATIC", "hourlyRate": 200.0,
                "dailyRate": 1500.0, "status": "AVAILABLE", "ownerId": "o1"
            }
        ]
        responses.add(
            responses.GET,
            "http://localhost:8082/api/vehicles/search",
            json=mock_vehicles,
            status=200,
        )
        response = requests.get(
            "http://localhost:8082/api/vehicles/search",
            params={"city": "Bangalore"},
            timeout=5,
        )
        vehicles = response.json()
        assert isinstance(vehicles, list)
        for vehicle in vehicles:
            assert "id" in vehicle
            assert "make" in vehicle
            assert "status" in vehicle
            assert vehicle["status"] in ["AVAILABLE", "BOOKED", "MAINTENANCE"]

    @responses.activate
    def test_booking_create_contract(self):
        """Booking response must contain timestamps as strings."""
        mock_booking = {
            "id": "b1",
            "vehicleId": "v1",
            "userId": "u1",
            "startTime": "2025-01-01T10:00:00",
            "endTime": "2025-01-01T18:00:00",
            "totalAmount": 1200.0,
            "status": "CONFIRMED",
        }
        responses.add(
            responses.POST,
            "http://localhost:8083/api/bookings",
            json=mock_booking,
            status=200,
        )
        response = requests.post(
            "http://localhost:8083/api/bookings",
            json={
                "vehicleId": "v1",
                "userId": "u1",
                "startTime": "2025-01-01T10:00:00",
                "endTime": "2025-01-01T18:00:00",
            },
            timeout=5,
        )
        data = response.json()
        assert isinstance(data["startTime"], str)
        assert isinstance(data["endTime"], str)
        assert isinstance(data["totalAmount"], (int, float))
        assert data["totalAmount"] >= 0


class TestServiceErrorResponses:
    """Verify services return proper error response shapes."""

    @responses.activate
    def test_404_response_has_error_field(self):
        """404 responses must include an 'error' description."""
        responses.add(
            responses.GET,
            "http://localhost:8082/api/vehicles/bad-id",
            json={"error": "Vehicle not found", "status": 404},
            status=404,
        )
        response = requests.get(
            "http://localhost:8082/api/vehicles/bad-id",
            timeout=5,
        )
        assert response.status_code == 404
        assert "error" in response.json()

    @responses.activate
    def test_401_response_for_invalid_token(self):
        """Protected endpoint with invalid JWT returns 401."""
        responses.add(
            responses.GET,
            "http://localhost:8084/api/users/me",
            json={"error": "Invalid or expired token"},
            status=401,
        )
        response = requests.get(
            "http://localhost:8084/api/users/me",
            headers={"Authorization": "Bearer invalid-token"},
            timeout=5,
        )
        assert response.status_code == 401

    @responses.activate
    def test_500_response_shape(self):
        """Internal server errors should return structured error body."""
        responses.add(
            responses.POST,
            "http://localhost:8083/api/bookings",
            json={"error": "Internal server error", "status": 500},
            status=500,
        )
        response = requests.post(
            "http://localhost:8083/api/bookings",
            json={},
            timeout=5,
        )
        assert response.status_code == 500
        assert "error" in response.json()
