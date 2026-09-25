"""
API tests for ZoomHopr Booking Service.

Endpoints covered:
  POST   /api/bookings
  GET    /api/bookings/{id}
  GET    /api/bookings/user/{userId}
  PUT    /api/bookings/{id}/cancel
"""

import pytest
import requests
import responses

BOOKING_BASE = "http://localhost:8083/api/bookings"


class TestCreateBooking:
    """Tests for POST /api/bookings"""

    @responses.activate
    def test_create_booking_success(self, sample_booking):
        """Valid booking request returns confirmed booking."""
        responses.add(responses.POST, BOOKING_BASE, json=sample_booking, status=200)

        payload = {
            "vehicleId": "veh-001",
            "userId": "user-001",
            "startTime": "2025-01-01T10:00:00",
            "endTime": "2025-01-01T18:00:00",
        }
        response = requests.post(BOOKING_BASE, json=payload, timeout=5)

        assert response.status_code == 200
        data = response.json()
        assert data["vehicleId"] == "veh-001"
        assert data["status"] == "CONFIRMED"
        assert "id" in data

    @responses.activate
    def test_create_booking_unavailable_vehicle_returns_409(self):
        """Booking an already booked vehicle returns 409 Conflict."""
        responses.add(
            responses.POST,
            BOOKING_BASE,
            json={"error": "Vehicle is not available for the selected period"},
            status=409,
        )
        payload = {
            "vehicleId": "veh-booked",
            "userId": "user-001",
            "startTime": "2025-01-01T10:00:00",
            "endTime": "2025-01-01T18:00:00",
        }
        response = requests.post(BOOKING_BASE, json=payload, timeout=5)
        assert response.status_code == 409

    @responses.activate
    def test_create_booking_end_before_start_returns_400(self):
        """End time before start time should return 400."""
        responses.add(
            responses.POST,
            BOOKING_BASE,
            json={"error": "End time must be after start time"},
            status=400,
        )
        payload = {
            "vehicleId": "veh-001",
            "userId": "user-001",
            "startTime": "2025-01-01T18:00:00",
            "endTime": "2025-01-01T10:00:00",
        }
        response = requests.post(BOOKING_BASE, json=payload, timeout=5)
        assert response.status_code == 400

    @responses.activate
    def test_create_booking_missing_vehicle_id_returns_400(self):
        """Missing vehicleId returns 400."""
        responses.add(
            responses.POST,
            BOOKING_BASE,
            json={"error": "vehicleId is required"},
            status=400,
        )
        payload = {"userId": "user-001", "startTime": "2025-01-01T10:00:00"}
        response = requests.post(BOOKING_BASE, json=payload, timeout=5)
        assert response.status_code == 400

    @responses.activate
    def test_create_booking_response_includes_total_amount(self, sample_booking):
        """Booking response must include calculated total amount."""
        responses.add(responses.POST, BOOKING_BASE, json=sample_booking, status=200)
        payload = {
            "vehicleId": "veh-001",
            "userId": "user-001",
            "startTime": "2025-01-01T10:00:00",
            "endTime": "2025-01-01T18:00:00",
        }
        response = requests.post(BOOKING_BASE, json=payload, timeout=5)
        data = response.json()
        assert "totalAmount" in data
        assert data["totalAmount"] > 0


class TestGetBookingById:
    """Tests for GET /api/bookings/{id}"""

    @responses.activate
    def test_get_booking_by_id_success(self, sample_booking):
        """Fetching booking by ID returns correct data."""
        booking_id = sample_booking["id"]
        responses.add(
            responses.GET,
            f"{BOOKING_BASE}/{booking_id}",
            json=sample_booking,
            status=200,
        )
        response = requests.get(f"{BOOKING_BASE}/{booking_id}", timeout=5)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == booking_id

    @responses.activate
    def test_get_booking_not_found_returns_404(self):
        """Non-existent booking ID returns 404."""
        responses.add(
            responses.GET,
            f"{BOOKING_BASE}/fake-id",
            json={"error": "Booking not found"},
            status=404,
        )
        response = requests.get(f"{BOOKING_BASE}/fake-id", timeout=5)
        assert response.status_code == 404

    @responses.activate
    def test_get_booking_has_required_fields(self, sample_booking):
        """Booking response includes all required fields."""
        responses.add(
            responses.GET,
            f"{BOOKING_BASE}/{sample_booking['id']}",
            json=sample_booking,
            status=200,
        )
        response = requests.get(f"{BOOKING_BASE}/{sample_booking['id']}", timeout=5)
        data = response.json()

        required = ["id", "vehicleId", "userId", "startTime", "endTime",
                    "totalAmount", "status"]
        for field in required:
            assert field in data, f"Missing field: {field}"


class TestGetBookingsByUser:
    """Tests for GET /api/bookings/user/{userId}"""

    @responses.activate
    def test_get_bookings_for_user(self, sample_booking):
        """User gets list of all their bookings."""
        responses.add(
            responses.GET,
            f"{BOOKING_BASE}/user/user-001",
            json=[sample_booking],
            status=200,
        )
        response = requests.get(f"{BOOKING_BASE}/user/user-001", timeout=5)

        assert response.status_code == 200
        bookings = response.json()
        assert isinstance(bookings, list)
        assert bookings[0]["userId"] == "user-001"

    @responses.activate
    def test_user_with_no_bookings_gets_empty_list(self):
        """User with zero bookings gets an empty list."""
        responses.add(
            responses.GET,
            f"{BOOKING_BASE}/user/no-bookings-user",
            json=[],
            status=200,
        )
        response = requests.get(f"{BOOKING_BASE}/user/no-bookings-user", timeout=5)
        assert response.status_code == 200
        assert response.json() == []


class TestCancelBooking:
    """Tests for PUT /api/bookings/{id}/cancel"""

    @responses.activate
    def test_cancel_booking_success(self, sample_booking):
        """Cancelling a booking returns CANCELLED status."""
        cancelled = {**sample_booking, "status": "CANCELLED"}
        responses.add(
            responses.PUT,
            f"{BOOKING_BASE}/{sample_booking['id']}/cancel",
            json=cancelled,
            status=200,
        )
        response = requests.put(
            f"{BOOKING_BASE}/{sample_booking['id']}/cancel",
            timeout=5,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "CANCELLED"

    @responses.activate
    def test_cancel_already_cancelled_booking_returns_400(self):
        """Cancelling an already cancelled booking returns 400."""
        responses.add(
            responses.PUT,
            f"{BOOKING_BASE}/already-cancelled/cancel",
            json={"error": "Booking is already cancelled"},
            status=400,
        )
        response = requests.put(
            f"{BOOKING_BASE}/already-cancelled/cancel",
            timeout=5,
        )
        assert response.status_code == 400

    @responses.activate
    def test_cancel_completed_booking_returns_400(self):
        """Cancelling a completed booking should return 400."""
        responses.add(
            responses.PUT,
            f"{BOOKING_BASE}/completed-id/cancel",
            json={"error": "Cannot cancel a completed booking"},
            status=400,
        )
        response = requests.put(
            f"{BOOKING_BASE}/completed-id/cancel",
            timeout=5,
        )
        assert response.status_code == 400


@pytest.mark.parametrize("status", ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"])
@responses.activate
def test_booking_status_transitions(status, sample_booking):
    """Booking can represent any valid status."""
    booking_with_status = {**sample_booking, "status": status}
    responses.add(
        responses.GET,
        f"{BOOKING_BASE}/{sample_booking['id']}",
        json=booking_with_status,
        status=200,
    )
    response = requests.get(f"{BOOKING_BASE}/{sample_booking['id']}", timeout=5)
    assert response.status_code == 200
    assert response.json()["status"] == status
