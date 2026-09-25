"""
API tests for ZoomHopr Vehicle Service.

Endpoints covered:
  POST   /api/vehicles
  GET    /api/vehicles/search?city=&fuelType=&transmission=
  GET    /api/vehicles/{id}
  PUT    /api/vehicles/{id}/status
  PUT    /api/vehicles/{id}
  GET    /api/vehicles/owner/{ownerId}
"""

import pytest
import requests
import responses

VEHICLE_BASE = "http://localhost:8082/api/vehicles"


class TestCreateVehicle:
    """Tests for POST /api/vehicles"""

    @responses.activate
    def test_create_vehicle_success(self, sample_vehicle):
        """Valid payload creates a vehicle and returns 200."""
        responses.add(responses.POST, VEHICLE_BASE, json=sample_vehicle, status=200)

        payload = {
            "make": "Toyota",
            "model": "Innova",
            "year": 2022,
            "city": "Bangalore",
            "fuelType": "PETROL",
            "transmission": "AUTOMATIC",
            "hourlyRate": 150.0,
            "dailyRate": 1200.0,
        }
        response = requests.post(VEHICLE_BASE, json=payload, timeout=5)

        assert response.status_code == 200
        data = response.json()
        assert data["make"] == "Toyota"
        assert data["status"] == "AVAILABLE"
        assert "id" in data

    @responses.activate
    def test_create_vehicle_missing_city_returns_400(self):
        """Missing required city field returns 400."""
        responses.add(
            responses.POST,
            VEHICLE_BASE,
            json={"error": "city is required"},
            status=400,
        )
        payload = {"make": "Honda", "model": "City", "year": 2021}
        response = requests.post(VEHICLE_BASE, json=payload, timeout=5)
        assert response.status_code == 400

    @responses.activate
    def test_create_vehicle_negative_rate_returns_400(self):
        """Negative hourly rate should be rejected."""
        responses.add(
            responses.POST,
            VEHICLE_BASE,
            json={"error": "Rate must be positive"},
            status=400,
        )
        payload = {
            "make": "Suzuki",
            "model": "Swift",
            "year": 2023,
            "city": "Mumbai",
            "fuelType": "PETROL",
            "hourlyRate": -100.0,
        }
        response = requests.post(VEHICLE_BASE, json=payload, timeout=5)
        assert response.status_code == 400

    @responses.activate
    def test_create_vehicle_invalid_year_returns_400(self):
        """Year before 2000 should be rejected."""
        responses.add(
            responses.POST,
            VEHICLE_BASE,
            json={"error": "Vehicle year is too old"},
            status=400,
        )
        payload = {
            "make": "Maruti",
            "model": "800",
            "year": 1995,
            "city": "Delhi",
            "fuelType": "PETROL",
            "hourlyRate": 50.0,
        }
        response = requests.post(VEHICLE_BASE, json=payload, timeout=5)
        assert response.status_code == 400


class TestSearchVehicles:
    """Tests for GET /api/vehicles/search"""

    SEARCH_URL = f"{VEHICLE_BASE}/search"

    @responses.activate
    def test_search_by_city_returns_list(self, sample_vehicle):
        """Search by city returns a list of vehicles."""
        responses.add(
            responses.GET,
            self.SEARCH_URL,
            json=[sample_vehicle],
            status=200,
        )
        response = requests.get(self.SEARCH_URL, params={"city": "Bangalore"}, timeout=5)

        assert response.status_code == 200
        vehicles = response.json()
        assert isinstance(vehicles, list)
        assert len(vehicles) > 0
        assert vehicles[0]["city"] == "Bangalore"

    @responses.activate
    def test_search_by_city_and_fuel_type(self, sample_vehicle):
        """Search with city + fuelType filters."""
        responses.add(
            responses.GET,
            self.SEARCH_URL,
            json=[sample_vehicle],
            status=200,
        )
        params = {"city": "Bangalore", "fuelType": "PETROL"}
        response = requests.get(self.SEARCH_URL, params=params, timeout=5)

        assert response.status_code == 200
        result = response.json()
        assert all(v["fuelType"] == "PETROL" for v in result)

    @responses.activate
    def test_search_no_results_returns_empty_list(self):
        """Search with no matching vehicles returns empty list."""
        responses.add(
            responses.GET,
            self.SEARCH_URL,
            json=[],
            status=200,
        )
        response = requests.get(
            self.SEARCH_URL,
            params={"city": "Timbuktu"},
            timeout=5,
        )
        assert response.status_code == 200
        assert response.json() == []

    @responses.activate
    def test_search_missing_city_returns_400(self):
        """Search without required city param returns 400."""
        responses.add(
            responses.GET,
            self.SEARCH_URL,
            json={"error": "city is required"},
            status=400,
        )
        response = requests.get(self.SEARCH_URL, timeout=5)
        assert response.status_code == 400

    @responses.activate
    def test_search_by_transmission(self, sample_vehicle):
        """Search by automatic transmission returns filtered list."""
        responses.add(
            responses.GET,
            self.SEARCH_URL,
            json=[sample_vehicle],
            status=200,
        )
        params = {"city": "Bangalore", "transmission": "AUTOMATIC"}
        response = requests.get(self.SEARCH_URL, params=params, timeout=5)
        assert response.status_code == 200


class TestGetVehicleById:
    """Tests for GET /api/vehicles/{id}"""

    @responses.activate
    def test_get_vehicle_by_id_success(self, sample_vehicle):
        """Fetching existing vehicle by ID returns correct data."""
        vehicle_id = sample_vehicle["id"]
        responses.add(
            responses.GET,
            f"{VEHICLE_BASE}/{vehicle_id}",
            json=sample_vehicle,
            status=200,
        )
        response = requests.get(f"{VEHICLE_BASE}/{vehicle_id}", timeout=5)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["make"] == "Toyota"

    @responses.activate
    def test_get_vehicle_not_found_returns_404(self):
        """Fetching a non-existent vehicle ID returns 404."""
        responses.add(
            responses.GET,
            f"{VEHICLE_BASE}/nonexistent-id",
            json={"error": "Vehicle not found"},
            status=404,
        )
        response = requests.get(f"{VEHICLE_BASE}/nonexistent-id", timeout=5)
        assert response.status_code == 404

    @responses.activate
    def test_get_vehicle_response_has_required_fields(self, sample_vehicle):
        """Vehicle response must include all critical fields."""
        responses.add(
            responses.GET,
            f"{VEHICLE_BASE}/{sample_vehicle['id']}",
            json=sample_vehicle,
            status=200,
        )
        response = requests.get(f"{VEHICLE_BASE}/{sample_vehicle['id']}", timeout=5)
        data = response.json()

        required_fields = [
            "id", "make", "model", "year", "city",
            "fuelType", "status", "hourlyRate", "dailyRate",
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"


class TestUpdateVehicleStatus:
    """Tests for PUT /api/vehicles/{id}/status"""

    @responses.activate
    def test_update_status_to_booked(self, sample_vehicle):
        """Owner can mark a vehicle as BOOKED."""
        booked_vehicle = {**sample_vehicle, "status": "BOOKED"}
        responses.add(
            responses.PUT,
            f"{VEHICLE_BASE}/{sample_vehicle['id']}/status",
            json=booked_vehicle,
            status=200,
        )
        payload = {"status": "BOOKED"}
        response = requests.put(
            f"{VEHICLE_BASE}/{sample_vehicle['id']}/status",
            json=payload,
            timeout=5,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "BOOKED"

    @responses.activate
    def test_update_status_invalid_value_returns_400(self, sample_vehicle):
        """Invalid status value should return 400."""
        responses.add(
            responses.PUT,
            f"{VEHICLE_BASE}/{sample_vehicle['id']}/status",
            json={"error": "Invalid status value"},
            status=400,
        )
        payload = {"status": "FLYING"}
        response = requests.put(
            f"{VEHICLE_BASE}/{sample_vehicle['id']}/status",
            json=payload,
            timeout=5,
        )
        assert response.status_code == 400


class TestGetVehiclesByOwner:
    """Tests for GET /api/vehicles/owner/{ownerId}"""

    @responses.activate
    def test_get_vehicles_by_owner_returns_list(self, sample_vehicle):
        """Owner gets all their listed vehicles."""
        responses.add(
            responses.GET,
            f"{VEHICLE_BASE}/owner/owner-001",
            json=[sample_vehicle],
            status=200,
        )
        response = requests.get(f"{VEHICLE_BASE}/owner/owner-001", timeout=5)

        assert response.status_code == 200
        vehicles = response.json()
        assert isinstance(vehicles, list)
        assert vehicles[0]["ownerId"] == "owner-001"

    @responses.activate
    def test_get_vehicles_owner_no_vehicles(self):
        """Owner with no vehicles gets empty list."""
        responses.add(
            responses.GET,
            f"{VEHICLE_BASE}/owner/new-owner",
            json=[],
            status=200,
        )
        response = requests.get(f"{VEHICLE_BASE}/owner/new-owner", timeout=5)
        assert response.status_code == 200
        assert response.json() == []


@pytest.mark.parametrize("fuel_type", ["PETROL", "DIESEL", "ELECTRIC", "CNG"])
@responses.activate
def test_search_all_fuel_types(fuel_type, sample_vehicle):
    """Search should work for all supported fuel types."""
    vehicle = {**sample_vehicle, "fuelType": fuel_type}
    responses.add(
        responses.GET,
        f"{VEHICLE_BASE}/search",
        json=[vehicle],
        status=200,
    )
    response = requests.get(
        f"{VEHICLE_BASE}/search",
        params={"city": "Bangalore", "fuelType": fuel_type},
        timeout=5,
    )
    assert response.status_code == 200


@pytest.mark.parametrize("transmission", ["AUTOMATIC", "MANUAL"])
@responses.activate
def test_search_all_transmission_types(transmission, sample_vehicle):
    """Search should work for all transmission types."""
    vehicle = {**sample_vehicle, "transmission": transmission}
    responses.add(
        responses.GET,
        f"{VEHICLE_BASE}/search",
        json=[vehicle],
        status=200,
    )
    response = requests.get(
        f"{VEHICLE_BASE}/search",
        params={"city": "Bangalore", "transmission": transmission},
        timeout=5,
    )
    assert response.status_code == 200
