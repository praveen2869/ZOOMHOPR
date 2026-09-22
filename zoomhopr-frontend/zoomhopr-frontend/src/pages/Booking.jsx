import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking, getVehicle } from "../api";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function calculateFare(vehicle, start, end) {
  if (!vehicle || !start || !end) {
    return 0;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const milliseconds = endDate - startDate;

  if (milliseconds <= 0) {
    return 0;
  }

  const hours = Math.max(
    1,
    Math.ceil(milliseconds / (1000 * 60 * 60))
  );

  if (hours >= 24) {
    const days = Math.ceil(hours / 24);

    return Number(vehicle.dailyRate) * days;
  }

  return Number(vehicle.hourlyRate) * hours;
}

export default function Booking() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicle(vehicleId);

        console.log("Booking vehicle:", data);

        setVehicle(data);
      } catch (err) {
        console.error("Vehicle loading failed:", err);

        setError(
          err.message || "Unable to load vehicle."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [vehicleId]);

  const estimatedFare = calculateFare(
    vehicle,
    startTime,
    endTime
  );

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!startTime || !endTime) {
      setError(
        "Please select pickup and return time."
      );
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setError(
        "Return time must be after pickup time."
      );
      return;
    }

    if (!localStorage.getItem("accessToken")) {
      setError(
        "Please login before booking."
      );
      return;
    }

    try {
      setSubmitting(true);

      console.log("Creating booking:", {
        riderId: localStorage.getItem("userId"),
        vehicleId,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });

      const booking = await createBooking({
        vehicleId,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });

      console.log(
        "Booking created successfully:",
        booking
      );

      navigate("/bookings");
    } catch (err) {
      console.error(
        "Booking creation failed:",
        err
      );

      setError(
        err.message ||
        "Unable to create booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="dashboard-page narrow">
        <div className="empty-card">
          <div className="empty-icon">
            🚗
          </div>

          <h2>
            Loading vehicle...
          </h2>

          <p>
            Please wait while we load the
            booking details.
          </p>
        </div>
      </section>
    );
  }

  if (!vehicle) {
    return (
      <section className="dashboard-page narrow">

        <div className="error-box">
          {error || "Vehicle not found."}
        </div>

        <button
          className="secondary-btn"
          onClick={() =>
            navigate("/vehicles")
          }
          style={{
            marginTop: "20px"
          }}
        >
          ← Back to cars
        </button>

      </section>
    );
  }

  return (
    <section className="dashboard-page">

      <button
        className="secondary-btn"
        onClick={() =>
          navigate(`/vehicles/${vehicle.id}`)
        }
        style={{
          marginBottom: "25px"
        }}
      >
        ← Back to vehicle
      </button>

      <div className="page-title">

        <p className="eyebrow dark">
          BOOK YOUR RIDE
        </p>

        <h1>
          {vehicle.make} {vehicle.model}
        </h1>

        <p className="muted">
          Choose your pickup and return time.
        </p>

      </div>

      {error && (
        <div
          className="error-box"
          style={{
            marginBottom: "20px"
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1.2fr 0.8fr",
          gap: "30px",
          alignItems: "start"
        }}
      >

        {/* BOOKING FORM */}

        <form
          className="search-card"
          onSubmit={handleSubmit}
          style={{
            display: "block"
          }}
        >

          <h2>
            Trip details
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "20px",
              marginTop: "25px"
            }}
          >

            <div className="field">

              <small>
                PICKUP DATE & TIME
              </small>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
                required
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />

            </div>

            <div className="field">

              <small>
                RETURN DATE & TIME
              </small>

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value
                  )
                }
                required
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />

            </div>

          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={submitting}
            style={{
              width: "100%",
              marginTop: "30px"
            }}
          >
            {submitting
              ? "Creating booking..."
              : "Confirm booking"}
          </button>

        </form>

        {/* SUMMARY */}

        <div
          className="empty-card"
          style={{
            textAlign: "left"
          }}
        >

          <p className="eyebrow dark">
            BOOKING SUMMARY
          </p>

          <h2>
            {vehicle.make} {vehicle.model}
          </h2>

          <p className="muted">
            {vehicle.year} ·{" "}
            {vehicle.fuelType} ·{" "}
            {vehicle.transmission}
          </p>

          <div
            style={{
              borderTop:
                "1px solid #eee",
              marginTop: "20px",
              paddingTop: "20px"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between"
              }}
            >
              <span>
                Hourly rate
              </span>

              <strong>
                {money(
                  vehicle.hourlyRate
                )}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: "12px"
              }}
            >
              <span>
                Daily rate
              </span>

              <strong>
                {money(
                  vehicle.dailyRate
                )}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                borderTop:
                  "1px solid #eee",
                marginTop: "20px",
                paddingTop: "20px"
              }}
            >

              <strong>
                Estimated total
              </strong>

              <strong
                style={{
                  fontSize: "22px"
                }}
              >
                {money(estimatedFare)}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}