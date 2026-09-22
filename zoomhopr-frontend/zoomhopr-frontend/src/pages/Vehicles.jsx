import React, { useEffect, useState } from "react";
import { getVehicles } from "../api";
import { useNavigate } from "react-router-dom";

const fallbackImages = [
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1625231334168-35067f8853e4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80"
];

function getCarImage(vehicle, index) {
  const text = `${vehicle.make || ""} ${vehicle.model || ""}`.toLowerCase();

  if (text.includes("thar")) {
    return fallbackImages[1];
  }

  if (
    vehicle.fuelType === "ELECTRIC" ||
    text.includes("nexon")
  ) {
    return fallbackImages[3];
  }

  if (
    text.includes("city") ||
    text.includes("sedan")
  ) {
    return fallbackImages[2];
  }

  return fallbackImages[index % fallbackImages.length];
}

function formatFuelType(value) {
  if (!value) return "Fuel";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatTransmission(value) {
  if (!value) return "Transmission";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatPrice(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [city, setCity] = useState("Bengaluru");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");

  async function loadVehicles(
  searchCity = city,
  searchFuelType = fuelType,
  searchTransmission = transmission
) {
  try {
    setLoading(true);
    setError("");

    console.log("Searching vehicles:", {
      city: searchCity,
      fuelType: searchFuelType,
      transmission: searchTransmission,
      hasToken: Boolean(localStorage.getItem("accessToken"))
    });

    const data = await getVehicles(
      searchCity,
      searchFuelType,
      searchTransmission
    );

    console.log("Vehicles received:", data);

    setVehicles(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Vehicle search failed:", err);
    setError(err.message || "Unable to load vehicles");
    setVehicles([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
  if (localStorage.getItem("accessToken")) {
    loadVehicles("Bengaluru", "", "");
  } else {
    setLoading(false);
    setError("Please sign in to search for vehicles.");
  }
}, []);
  function handleSearch(event) {
  event.preventDefault();

  loadVehicles(
    city,
    fuelType,
    transmission
  );
}

  return (
    <section className="dashboard-page">

      <div className="page-title">
        <p className="eyebrow dark">EXPLORE</p>

        <h1>Find your next ride</h1>

        <p className="muted">
          Browse available cars around Bengaluru and choose
          what fits your trip.
        </p>
      </div>

      {/* Search / Filter section */}

      <form
        className="search-card"
        onSubmit={handleSearch}
        style={{ marginBottom: "35px" }}
      >

        <div className="search-grid">

          <div className="field">
            <small>PICKUP LOCATION</small>

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              style={{
                border: "0",
                outline: "0",
                width: "100%",
                fontWeight: "700",
                background: "transparent"
              }}
            />

            <span>
              Search available cars in this city
            </span>
          </div>

          <div className="field">

            <small>FUEL TYPE</small>

            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              style={{
                border: "0",
                outline: "0",
                width: "100%",
                fontWeight: "700",
                background: "transparent"
              }}
            >
              <option value="">All fuel types</option>
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>

          </div>

          <div className="field">

            <small>TRANSMISSION</small>

            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              style={{
                border: "0",
                outline: "0",
                width: "100%",
                fontWeight: "700",
                background: "transparent"
              }}
            >
              <option value="">All transmissions</option>
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL">Manual</option>
            </select>

          </div>

          <button
            type="submit"
            className="primary-btn search-btn"
          >
            Search cars
          </button>

        </div>

      </form>

      {/* Error */}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* Loading */}

      {loading && (
        <div className="empty-card">
          <div className="empty-icon">🚗</div>
          <h2>Finding cars...</h2>
          <p>
            Searching available vehicles around {city}.
          </p>
        </div>
      )}

      {/* No vehicles */}

      {!loading && !error && vehicles.length === 0 && (
        <div className="empty-card">

          <div className="empty-icon">
            🚘
          </div>

          <h2>No cars available</h2>

          <p>
            We couldn't find any available cars in {city}.
            Try another city or remove the filters.
          </p>

          <button
            className="secondary-btn"
            onClick={() => {
              setFuelType("");
              setTransmission("");
              setCity("Bengaluru");
              setTimeout(loadVehicles, 0);
            }}
          >
            Reset search
          </button>

        </div>
      )}

      {/* Real vehicles */}

      {!loading && vehicles.length > 0 && (

        <>

          <div className="section-head">

            <div>
              <p className="eyebrow dark">
                AVAILABLE NOW
              </p>

              <h2>
                {vehicles.length}{" "}
                {vehicles.length === 1 ? "car" : "cars"} found
              </h2>
            </div>

            <span className="muted">
              {city}
            </span>

          </div>

          <div className="car-grid">

            {vehicles.map((vehicle, index) => (

              <article
                className="car-card"
                key={vehicle.id}
              >

                <div
                  className="car-image"
                  style={{
                    backgroundImage:
                      `url(${getCarImage(vehicle, index)})`
                  }}
                >

                  <span className="pill">
                    AVAILABLE
                  </span>

                </div>

                <div className="car-info">

                  <div>

                    <h3>
                      {vehicle.make} {vehicle.model}
                    </h3>

                    <p>
                      {formatFuelType(vehicle.fuelType)}
                      {" · "}
                      {formatTransmission(vehicle.transmission)}
                      {" · "}
                      {vehicle.year || "—"}
                    </p>

                  </div>

                  <div className="price">

                    <strong>
                      {formatPrice(vehicle.dailyRate)}
                    </strong>

                    <span>
                      / day
                    </span>

                  </div>

                </div>

                <div
                  style={{
                    padding: "0 17px 12px",
                    color: "#777",
                    fontSize: "12px"
                  }}
                >

                  <div>
                    📍 {vehicle.city}
                  </div>

                  {vehicle.hourlyRate && (
                    <div style={{ marginTop: "5px" }}>
                      ₹{Number(vehicle.hourlyRate).toLocaleString("en-IN")}
                      {" / hour"}
                    </div>
                  )}

                </div>

                <button
                   className="secondary-btn full"
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                >
                   Select car
                </button>

              </article>

            ))}

          </div>

        </>

      )}

    </section>
  );
}