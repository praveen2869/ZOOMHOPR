import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVehicle } from "../api";

export default function HostAddVehicle({ user }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    fuelType: "PETROL",
    transmission: "MANUAL",
    registrationNumber: "",
    hourlyRate: "",
    dailyRate: "",
    dailyKmLimit: "300",
    extraKmRate: "15",
    city: "Bengaluru",
    currentLatitude: "",
    currentLongitude: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const userId =
      user?.userId ||
      user?.id ||
      localStorage.getItem("userId");

    if (!userId) {
      setError("Unable to identify your account. Please login again.");
      return;
    }

    if (
      !form.make ||
      !form.model ||
      !form.registrationNumber ||
      !form.hourlyRate ||
      !form.dailyRate ||
      !form.city
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const vehicleData = {
        ownerId: userId,
        make: form.make.trim(),
        model: form.model.trim(),
        year: form.year ? Number(form.year) : null,
        fuelType: form.fuelType,
        transmission: form.transmission,
        registrationNumber: form.registrationNumber
          .trim()
          .toUpperCase(),
        hourlyRate: Number(form.hourlyRate),
        dailyRate: Number(form.dailyRate),
        dailyKmLimit: form.dailyKmLimit
          ? Number(form.dailyKmLimit)
          : 300,
        extraKmRate: form.extraKmRate
          ? Number(form.extraKmRate)
          : 15,
        city: form.city.trim(),
        currentLatitude: form.currentLatitude
          ? Number(form.currentLatitude)
          : null,
        currentLongitude: form.currentLongitude
          ? Number(form.currentLongitude)
          : null
      };

      console.log("Creating host vehicle:", vehicleData);

      const vehicle = await createVehicle(vehicleData);

      console.log("Vehicle created successfully:", vehicle);

      navigate("/host/vehicles");
    } catch (err) {
      console.error("Vehicle creation failed:", err);

      setError(
        err?.message ||
          "Unable to list your car. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-page narrow">

      <button
        type="button"
        className="secondary-btn"
        onClick={() => navigate("/dashboard")}
        style={{ marginBottom: "25px" }}
      >
        ← Back
      </button>

      <div className="page-title">
        <p className="eyebrow dark">
          BECOME A HOST
        </p>

        <h1>
          List your car
        </h1>

        <p className="muted">
          Set your car details, pricing and daily kilometre
          allowance.
        </p>
      </div>

      {error && (
        <div
          className="error-box"
          style={{ marginBottom: "20px" }}
        >
          {error}
        </div>
      )}

      <form
        className="search-card"
        onSubmit={handleSubmit}
        style={{ display: "block" }}
      >

        <h2>
          Vehicle details
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "25px"
          }}
        >

          <div className="field">
            <small>MAKE *</small>

            <input
              name="make"
              value={form.make}
              onChange={handleChange}
              placeholder="e.g. Hyundai"
              required
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            />
          </div>

          <div className="field">
            <small>MODEL *</small>

            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. Creta"
              required
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            />
          </div>

          <div className="field">
            <small>YEAR</small>

            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="2025"
              min="1900"
              max="2100"
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            />
          </div>

          <div className="field">
            <small>REGISTRATION NUMBER *</small>

            <input
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              placeholder="KA01AB1234"
              required
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            />
          </div>

          <div className="field">
            <small>FUEL TYPE *</small>

            <select
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            >
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="field">
            <small>TRANSMISSION *</small>

            <select
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            >
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
            </select>
          </div>

          <div className="field">
            <small>CITY *</small>

            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Bengaluru"
              required
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            />
          </div>

        </div>

        <div
          style={{
            borderTop: "1px solid #eee",
            marginTop: "30px",
            paddingTop: "25px"
          }}
        >
          <h2>
            Pricing
          </h2>

          <p className="muted">
            You decide how much guests pay for your car.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "20px"
            }}
          >

            <div className="field">
              <small>HOURLY RATE (₹) *</small>

              <input
                type="number"
                name="hourlyRate"
                value={form.hourlyRate}
                onChange={handleChange}
                placeholder="250"
                min="1"
                step="0.01"
                required
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />
            </div>

            <div className="field">
              <small>DAILY RATE (₹) *</small>

              <input
                type="number"
                name="dailyRate"
                value={form.dailyRate}
                onChange={handleChange}
                placeholder="2499"
                min="1"
                step="0.01"
                required
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />
            </div>

          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #eee",
            marginTop: "30px",
            paddingTop: "25px"
          }}
        >
          <h2>
            Kilometre allowance
          </h2>

          <p className="muted">
            Set the daily distance included in the rental.
            Guests pay extra for kilometres beyond this limit.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "20px"
            }}
          >

            <div className="field">
              <small>DAILY KM LIMIT</small>

              <input
                type="number"
                name="dailyKmLimit"
                value={form.dailyKmLimit}
                onChange={handleChange}
                min="1"
                step="1"
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />

              <span>
                Example: 300 km/day
              </span>
            </div>

            <div className="field">
              <small>EXTRA KM RATE (₹)</small>

              <input
                type="number"
                name="extraKmRate"
                value={form.extraKmRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />

              <span>
                Example: ₹15 per extra km
              </span>
            </div>

          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #eee",
            marginTop: "30px",
            paddingTop: "25px"
          }}
        >
          <h2>
            Location
          </h2>

          <p className="muted">
            Optional location coordinates can be added later.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "20px"
            }}
          >

            <div className="field">
              <small>LATITUDE</small>

              <input
                type="number"
                name="currentLatitude"
                value={form.currentLatitude}
                onChange={handleChange}
                placeholder="12.9716"
                step="any"
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />
            </div>

            <div className="field">
              <small>LONGITUDE</small>

              <input
                type="number"
                name="currentLongitude"
                value={form.currentLongitude}
                onChange={handleChange}
                placeholder="77.5946"
                step="any"
                style={{
                  width: "100%",
                  marginTop: "8px"
                }}
              />
            </div>

          </div>
        </div>

        <button
          type="submit"
          className="primary-btn"
          disabled={submitting}
          style={{
            width: "100%",
            marginTop: "35px"
          }}
        >
          {submitting
            ? "Listing your car..."
            : "List my car"}
        </button>

      </form>

    </section>
  );
}