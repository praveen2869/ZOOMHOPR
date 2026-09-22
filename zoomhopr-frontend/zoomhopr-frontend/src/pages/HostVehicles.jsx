import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getVehiclesByOwner } from "../api";

export default function HostVehicles({ user }) {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ownerId =
    user?.userId ||
    user?.id ||
    localStorage.getItem("userId");

  useEffect(() => {
    async function loadVehicles() {
      if (!ownerId) {
        setError("Unable to identify host.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getVehiclesByOwner(ownerId);

        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load host vehicles:", err);

        setError(
          err?.message || "Failed to load your vehicles."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, [ownerId]);

  function formatCurrency(value) {
    if (value === null || value === undefined) {
      return "—";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
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
          alignItems: "center",
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
            My cars
          </h1>

          <p
            style={{
              margin: 0,
              color: "#777"
            }}
          >
            Manage your listed cars, pricing and availability.
          </p>
        </div>

        <button
          className="dark-btn"
          onClick={() =>
            navigate("/host/vehicles/new")
          }
        >
          + List another car
        </button>
      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="car-card">
          <div className="car-info">
            <h3>
              Loading your cars...
            </h3>
          </div>
        </div>
      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
        <div
          className="car-card"
          style={{
            padding: "28px",
            border: "1px solid #f0b4b4"
          }}
        >
          <h3>
            Unable to load cars
          </h3>

          <p
            style={{
              color: "#777"
            }}
          >
            {error}
          </p>

          <button
            className="secondary-btn"
            onClick={() =>
              window.location.reload()
            }
          >
            Try again
          </button>
        </div>
      )}


      {/* =====================================================
          NO VEHICLES
      ===================================================== */}

      {!loading &&
        !error &&
        vehicles.length === 0 && (
          <div
            className="car-card"
            style={{
              padding: "48px",
              textAlign: "center"
            }}
          >
            <p className="eyebrow dark">
              NO CARS YET
            </p>

            <h2>
              List your first car
            </h2>

            <p
              style={{
                color: "#777"
              }}
            >
              Start earning by sharing your car
              with Zoomhopr guests.
            </p>

            <button
              className="dark-btn"
              onClick={() =>
                navigate("/host/vehicles/new")
              }
            >
              List your car
            </button>
          </div>
        )}


      {/* =====================================================
          VEHICLE LIST
      ===================================================== */}

      {!loading &&
        !error &&
        vehicles.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px"
            }}
          >

            {vehicles.map((vehicle) => (

              <article
                className="car-card"
                key={vehicle.id}
              >

                {/* =================================================
                    IMAGE / STATUS
                ================================================= */}

                <div
                  className="car-image"
                  style={{
                    background:
                      "linear-gradient(135deg, #202020, #555)",
                    minHeight: "190px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "18px"
                  }}
                >

                  <span className="pill">
                    {vehicle.status ||
                      "AVAILABLE"}
                  </span>

                  <span
                    style={{
                      background: "#d8ff24",
                      color: "#111",
                      borderRadius: "999px",
                      padding: "7px 12px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    HOST
                  </span>

                </div>


                {/* =================================================
                    VEHICLE INFORMATION
                ================================================= */}

                <div
                  className="car-info"
                  style={{
                    display: "block"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "15px",
                      alignItems:
                        "flex-start"
                    }}
                  >

                    <div>

                      <h3>
                        {vehicle.make}{" "}
                        {vehicle.model}
                      </h3>

                      <p>
                        {vehicle.year || "—"} ·{" "}
                        {vehicle.fuelType || "—"} ·{" "}
                        {vehicle.transmission || "—"}
                      </p>

                    </div>


                    <div
                      style={{
                        textAlign: "right"
                      }}
                    >

                      <strong>
                        {formatCurrency(
                          vehicle.dailyRate
                        )}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#777"
                        }}
                      >
                        / day
                      </span>

                    </div>

                  </div>


                  {/* =================================================
                      PRICING / KM INFORMATION
                  ================================================= */}

                  <div
                    style={{
                      marginTop: "22px",
                      paddingTop: "18px",
                      borderTop:
                        "1px solid #eee",
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "15px"
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
                        HOURLY RATE
                      </small>

                      <strong>
                        {formatCurrency(
                          vehicle.hourlyRate
                        )}
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
                        DAILY KM
                      </small>

                      <strong>
                        {vehicle.dailyKmLimit ??
                          300}{" "}
                        km
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
                        EXTRA KM
                      </small>

                      <strong>
                        {formatCurrency(
                          vehicle.extraKmRate
                        )}
                        /km
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
                        CITY
                      </small>

                      <strong>
                        {vehicle.city || "—"}
                      </strong>

                    </div>

                  </div>


                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div
                    style={{
                      marginTop: "22px",
                      display: "flex",
                      gap: "10px"
                    }}
                  >

                    <Link
                      to={`/vehicles/${vehicle.id}`}
                      className="secondary-btn"
                      style={{
                        flex: 1,
                        textAlign: "center"
                      }}
                    >
                      View car
                    </Link>


                    <button
                      className="dark-btn"
                      style={{
                        flex: 1
                      }}
                      onClick={() =>
                        navigate(
                          `/host/vehicles/${vehicle.id}/edit`
                        )
                      }
                    >
                      Manage
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

    </section>
  );
}