import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicle, updateVehicle } from "../api";

export default function HostEditVehicle() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    hourlyRate: "",
    dailyRate: "",
    dailyKmLimit: 300,
    extraKmRate: 15
  });

  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicle(id);

        setVehicle(data);

        setForm({
          hourlyRate: data.hourlyRate ?? "",
          dailyRate: data.dailyRate ?? "",
          dailyKmLimit: data.dailyKmLimit ?? 300,
          extraKmRate: data.extraKmRate ?? 15
        });
      } catch (err) {
        console.error("Failed to load vehicle:", err);
        setError(
          err?.message || "Failed to load vehicle."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadVehicle();
    }
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        hourlyRate: Number(form.hourlyRate),
        dailyRate: Number(form.dailyRate),
        dailyKmLimit: Number(form.dailyKmLimit),
        extraKmRate: Number(form.extraKmRate)
      };

      console.log("Updating vehicle:", id, payload);

      await updateVehicle(id, payload);

      navigate("/host/vehicles");
    } catch (err) {
      console.error("Failed to update vehicle:", err);

      setError(
        err?.message ||
          "Failed to update vehicle."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="car-card">
          <div className="car-info">
            <h3>Loading vehicle...</h3>
          </div>
        </div>
      </section>
    );
  }

  if (error && !vehicle) {
    return (
      <section className="section">
        <div
          className="car-card"
          style={{
            padding: "30px"
          }}
        >
          <p className="eyebrow dark">
            HOST DASHBOARD
          </p>

          <h2>
            Unable to load vehicle
          </h2>

          <p style={{ color: "#777" }}>
            {error}
          </p>

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/host/vehicles")
            }
          >
            ← Back to my cars
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "32px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <p className="eyebrow dark">
            HOST DASHBOARD
          </p>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "42px"
            }}
          >
            Manage your car
          </h1>

          <p
            style={{
              margin: 0,
              color: "#777"
            }}
          >
            {vehicle?.make} {vehicle?.model}
            {" · "}
            {vehicle?.registrationNumber || ""}
          </p>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={() =>
            navigate("/host/vehicles")
          }
        >
          ← Back to my cars
        </button>
      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px 18px",
            borderRadius: "10px",
            border: "1px solid #efb0b0",
            background: "#fff5f5",
            color: "#a33"
          }}
        >
          {error}
        </div>
      )}


      {/* =====================================================
          VEHICLE SUMMARY
      ===================================================== */}

      <div
        className="car-card"
        style={{
          marginBottom: "24px",
          padding: "24px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "20px"
          }}
        >

          <div>
            <small
              style={{
                display: "block",
                color: "#888",
                marginBottom: "5px"
              }}
            >
              VEHICLE
            </small>

            <strong>
              {vehicle?.make} {vehicle?.model}
            </strong>
          </div>

          <div>
            <small
              style={{
                display: "block",
                color: "#888",
                marginBottom: "5px"
              }}
            >
              YEAR
            </small>

            <strong>
              {vehicle?.year || "—"}
            </strong>
          </div>

          <div>
            <small
              style={{
                display: "block",
                color: "#888",
                marginBottom: "5px"
              }}
            >
              FUEL
            </small>

            <strong>
              {vehicle?.fuelType || "—"}
            </strong>
          </div>

          <div>
            <small
              style={{
                display: "block",
                color: "#888",
                marginBottom: "5px"
              }}
            >
              TRANSMISSION
            </small>

            <strong>
              {vehicle?.transmission || "—"}
            </strong>
          </div>

        </div>
      </div>


      {/* =====================================================
          EDIT FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="car-card"
        style={{
          padding: "30px"
        }}
      >

        <p className="eyebrow dark">
          HOST SETTINGS
        </p>

        <h2>
          Pricing & kilometre policy
        </h2>

        <p
          style={{
            color: "#777",
            marginBottom: "28px"
          }}
        >
          Set the price guests pay and the
          included daily kilometres.
        </p>


        {/* ===================================================
            PRICING
        =================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px"
          }}
        >

          <div className="field">

            <small>
              HOURLY RATE
            </small>

            <input
              type="number"
              name="hourlyRate"
              value={form.hourlyRate}
              onChange={handleChange}
              min="1"
              step="0.01"
              required
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            />

            <span>
              Price per hour
            </span>

          </div>


          <div className="field">

            <small>
              DAILY RATE
            </small>

            <input
              type="number"
              name="dailyRate"
              value={form.dailyRate}
              onChange={handleChange}
              min="1"
              step="0.01"
              required
              style={{
                width: "100%",
                marginTop: "8px"
              }}
            />

            <span>
              Price per day
            </span>

          </div>

        </div>


        {/* ===================================================
            KM POLICY
        =================================================== */}

        <div
          style={{
            marginTop: "30px",
            paddingTop: "30px",
            borderTop: "1px solid #eee"
          }}
        >

          <h3>
            Kilometre allowance
          </h3>

          <p
            style={{
              color: "#777"
            }}
          >
            Guests receive this many kilometres
            for each rental day. Extra kilometres
            are charged separately.
          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginTop: "20px"
            }}
          >

            <div className="field">

              <small>
                DAILY KM LIMIT
              </small>

              <input
                type="number"
                name="dailyKmLimit"
                value={form.dailyKmLimit}
                onChange={handleChange}
                min="1"
                step="1"
                required
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

              <small>
                EXTRA KM RATE
              </small>

              <input
                type="number"
                name="extraKmRate"
                value={form.extraKmRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
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


        {/* ===================================================
            PREVIEW
        =================================================== */}

        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            borderRadius: "14px",
            background: "#f7f7f7"
          }}
        >

          <small
            style={{
              display: "block",
              color: "#888",
              marginBottom: "8px"
            }}
          >
            CURRENT POLICY
          </small>

          <strong
            style={{
              fontSize: "18px"
            }}
          >
            ₹
            {Number(
              form.dailyRate || 0
            ).toLocaleString("en-IN")}
            {" / day · "}
            {Number(
              form.dailyKmLimit || 0
            ).toLocaleString("en-IN")}
            {" km/day · ₹"}
            {Number(
              form.extraKmRate || 0
            ).toLocaleString("en-IN")}
            {" / extra km"}
          </strong>

        </div>


        {/* ===================================================
            SAVE
        =================================================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "30px"
          }}
        >

          <button
            type="button"
            className="secondary-btn"
            onClick={() =>
              navigate("/host/vehicles")
            }
            style={{
              flex: 1
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="dark-btn"
            disabled={saving}
            style={{
              flex: 1
            }}
          >
            {saving
              ? "Saving..."
              : "Save changes"}
          </button>

        </div>

      </form>

    </section>
  );
}