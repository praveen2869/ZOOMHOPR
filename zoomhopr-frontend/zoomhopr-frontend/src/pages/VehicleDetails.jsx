import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicle } from "../api";

const vehicleImage =
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicle(id);

        console.log("Vehicle details:", data);

        setVehicle(data);
      } catch (err) {
        console.error("Vehicle details failed:", err);
        setError(err.message || "Unable to load vehicle");
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [id]);

  if (loading) {
    return (
      <section className="page">
        <div className="empty-card">
          <div className="empty-icon">🚗</div>
          <h2>Loading vehicle...</h2>
          <p>Please wait while we load the vehicle details.</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <div className="error-box">
          {error}
        </div>

        <button
          className="secondary-btn"
          onClick={() => navigate("/vehicles")}
          style={{ marginTop: "20px" }}
        >
          ← Back to cars
        </button>
      </section>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <section className="page">

      <button
        className="secondary-btn"
        onClick={() => navigate("/vehicles")}
        style={{ marginBottom: "25px" }}
      >
        ← Back to cars
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "35px",
          alignItems: "start"
        }}
      >

        {/* Vehicle image */}

        <div
          style={{
            height: "480px",
            borderRadius: "24px",
            backgroundImage: `url(${vehicleImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <span
            className="pill"
            style={{
              position: "absolute",
              top: "20px",
              left: "20px"
            }}
          >
            {vehicle.status}
          </span>
        </div>

        {/* Vehicle information */}

        <div>

          <p className="eyebrow dark">
            AVAILABLE VEHICLE
          </p>

          <h1>
            {vehicle.make} {vehicle.model}
          </h1>

          <p className="muted">
            {vehicle.year || "—"} ·{" "}
            {vehicle.fuelType} ·{" "}
            {vehicle.transmission}
          </p>

          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "16px",
              background: "#f5f5f5"
            }}
          >
            <strong>📍 {vehicle.city}</strong>

            <p className="muted">
              Vehicle available in {vehicle.city}
            </p>
          </div>

          {/* Vehicle specifications */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginTop: "20px"
            }}
          >

            <div className="field">
              <small>FUEL TYPE</small>
              <strong>{vehicle.fuelType}</strong>
            </div>

            <div className="field">
              <small>TRANSMISSION</small>
              <strong>{vehicle.transmission}</strong>
            </div>

            <div className="field">
              <small>YEAR</small>
              <strong>{vehicle.year || "—"}</strong>
            </div>

            <div className="field">
              <small>REGISTRATION</small>
              <strong>{vehicle.registrationNumber}</strong>
            </div>

          </div>

          {/* Pricing */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginTop: "25px"
            }}
          >

            <div
              style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "16px"
              }}
            >
              <small>HOURLY RATE</small>

              <h2>
                ₹{Number(vehicle.hourlyRate).toLocaleString("en-IN")}
              </h2>

              <span className="muted">
                per hour
              </span>
            </div>

            <div
              style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "16px"
              }}
            >
              <small>DAILY RATE</small>

              <h2>
                ₹{Number(vehicle.dailyRate).toLocaleString("en-IN")}
              </h2>

              <span className="muted">
                per day
              </span>
            </div>

          </div>

          {/* Continue */}

          <button
            className="primary-btn"
            style={{
              width: "100%",
              marginTop: "25px"
            }}
            onClick={() =>
              navigate(`/booking/${vehicle.id}`)
            }
          >
            Continue to booking
          </button>

        </div>

      </div>

    </section>
  );
}