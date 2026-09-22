import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBookings,
  getVehicle,
  cancelBooking,
  startBooking,
  endBooking
} from "../api";

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatPrice(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatFuel(value) {
  if (!value) return "—";

  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatTransmission(value) {
  if (!value) return "—";

  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tracks Start/End/Cancel action currently running
  const [actionLoading, setActionLoading] = useState(null);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const data = await getBookings();

      console.log("Bookings received:", data);

      const bookingList = Array.isArray(data) ? data : [];

      setBookings(bookingList);

      /*
       * Fetch vehicle details for every booking.
       */
      const uniqueVehicleIds = [
        ...new Set(
          bookingList
            .map((booking) => booking.vehicleId)
            .filter(Boolean)
        )
      ];

      const vehicleResults = await Promise.all(
        uniqueVehicleIds.map(async (vehicleId) => {
          try {
            const vehicle = await getVehicle(vehicleId);

            return {
              vehicleId,
              vehicle
            };
          } catch (err) {
            console.error(
              `Unable to load vehicle ${vehicleId}:`,
              err
            );

            return {
              vehicleId,
              vehicle: null
            };
          }
        })
      );

      const vehicleMap = {};

      vehicleResults.forEach(({ vehicleId, vehicle }) => {
        vehicleMap[vehicleId] = vehicle;
      });

      setVehicleDetails(vehicleMap);
    } catch (err) {
      console.error("Bookings failed:", err);

      setError(
        err.message || "Unable to load bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await cancelBooking(id);

      await loadBookings();
    } catch (err) {
      console.error(
        "Cancel booking failed:",
        err
      );

      setError(
        err.message || "Unable to cancel booking"
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStartTrip(id) {
    const odometer = window.prompt(
      "Enter starting odometer reading:"
    );

    if (odometer === null) {
      return;
    }

    if (
      !odometer.trim() ||
      Number.isNaN(Number(odometer)) ||
      Number(odometer) < 0
    ) {
      alert("Please enter a valid odometer reading.");
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      console.log("Starting trip:", {
        bookingId: id,
        odometerReading: Number(odometer)
      });

      await startBooking(
        id,
        Number(odometer)
      );

      await loadBookings();
    } catch (err) {
      console.error(
        "Start trip failed:",
        err
      );

      setError(
        err.message || "Unable to start trip"
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEndTrip(id) {
    const booking = bookings.find(
      (item) => item.id === id
    );

    const odometer = window.prompt(
      "Enter ending odometer reading:"
    );

    if (odometer === null) {
      return;
    }

    const endReading = Number(odometer);

    if (
      !odometer.trim() ||
      Number.isNaN(endReading) ||
      endReading < 0
    ) {
      alert("Please enter a valid odometer reading.");
      return;
    }

    if (
      booking?.startOdometer !== null &&
      booking?.startOdometer !== undefined &&
      endReading < Number(booking.startOdometer)
    ) {
      alert(
        `Ending odometer cannot be less than starting odometer (${booking.startOdometer}).`
      );
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      console.log("Ending trip:", {
        bookingId: id,
        startOdometer: booking?.startOdometer,
        endOdometer: endReading
      });

      await endBooking(
        id,
        endReading
      );

      await loadBookings();
    } catch (err) {
      console.error(
        "End trip failed:",
        err
      );

      setError(
        err.message || "Unable to end trip"
      );
    } finally {
      setActionLoading(null);
    }
  }

  function statusStyle(status) {
    if (status === "CONFIRMED") {
      return {
        background: "#e8f7e8",
        color: "#167316"
      };
    }

    if (status === "ONGOING") {
      return {
        background: "#fff4cc",
        color: "#8a6500"
      };
    }

    if (status === "CANCELLED") {
      return {
        background: "#ffe5e5",
        color: "#b42318"
      };
    }

    if (status === "COMPLETED") {
      return {
        background: "#e8f0ff",
        color: "#2457b5"
      };
    }

    return {
      background: "#f1f1f1",
      color: "#555"
    };
  }

  return (
    <section className="dashboard-page narrow">

      <div className="page-title">
        <p className="eyebrow dark">
          YOUR JOURNEYS
        </p>

        <h1>Trips</h1>

        <p className="muted">
          View your upcoming and completed journeys.
        </p>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {loading && (
        <div className="empty-card">

          <div className="empty-icon">
            🚗
          </div>

          <h2>
            Loading trips...
          </h2>

          <p>
            Fetching your bookings.
          </p>

        </div>
      )}

      {!loading &&
        !error &&
        bookings.length === 0 && (

          <div className="empty-card">

            <div className="empty-icon">
              ↗
            </div>

            <h2>
              No trips yet
            </h2>

            <p>
              Once you book a car,
              your journey will appear here.
            </p>

            <Link
              to="/vehicles"
              className="primary-btn"
            >
              Explore cars
            </Link>

          </div>
        )}

      {!loading &&
        bookings.length > 0 && (

          <div
            style={{
              display: "grid",
              gap: "20px"
            }}
          >

            {bookings.map((booking) => {

              const vehicle =
                vehicleDetails[booking.vehicleId];

              const isActionLoading =
                actionLoading === booking.id;

              /*
               * KM calculations.
               *
               * These values come from the backend.
               * We only calculate fallback values when
               * necessary for displaying the UI.
               */

              const allowedKm =
                booking.allowedKm !== null &&
                booking.allowedKm !== undefined
                  ? Number(booking.allowedKm)
                  : null;

              const distanceKm =
                booking.distanceKm !== null &&
                booking.distanceKm !== undefined
                  ? Number(booking.distanceKm)
                  : null;

              const extraKm =
                booking.extraKm !== null &&
                booking.extraKm !== undefined
                  ? Number(booking.extraKm)
                  : null;

              const extraKmRate =
                booking.extraKmRate !== null &&
                booking.extraKmRate !== undefined
                  ? Number(booking.extraKmRate)
                  : null;

              const extraKmCharge =
                booking.extraKmCharge !== null &&
                booking.extraKmCharge !== undefined
                  ? Number(booking.extraKmCharge)
                  : null;

              const hasExtraKm =
                extraKm !== null &&
                extraKm > 0;

              return (

                <article
                  key={booking.id}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "24px",
                    border: "1px solid #e5e5e5",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,0.05)"
                  }}
                >

                  {/* Header */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px"
                    }}
                  >

                    <div>

                      <p className="eyebrow dark">
                        YOUR TRIP
                      </p>

                      <h2>
                        {vehicle
                          ? `${vehicle.make} ${vehicle.model}`
                          : "Vehicle"}
                      </h2>

                      {vehicle && (
                        <p className="muted">
                          {vehicle.year}
                          {" · "}
                          {formatFuel(
                            vehicle.fuelType
                          )}
                          {" · "}
                          {formatTransmission(
                            vehicle.transmission
                          )}
                        </p>
                      )}

                    </div>

                    <span
                      className="pill"
                      style={statusStyle(
                        booking.status
                      )}
                    >
                      {booking.status}
                    </span>

                  </div>

                  {/* Location */}

                  {vehicle && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderRadius: "14px",
                        background: "#f7f7f7"
                      }}
                    >

                      <strong>
                        📍 {vehicle.city}
                      </strong>

                      <div
                        className="muted"
                        style={{
                          marginTop: "5px"
                        }}
                      >
                        Registration:{" "}
                        {vehicle.registrationNumber}
                      </div>

                    </div>
                  )}

                  {/* Trip information */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap: "20px",
                      marginTop: "25px"
                    }}
                  >

                    <div className="field">

                      <small>
                        PICKUP
                      </small>

                      <strong>
                        {formatDate(
                          booking.startTime
                        )}
                      </strong>

                    </div>

                    <div className="field">

                      <small>
                        RETURN
                      </small>

                      <strong>
                        {formatDate(
                          booking.endTime
                        )}
                      </strong>

                    </div>

                    <div className="field">

                      <small>
                        ESTIMATED FARE
                      </small>

                      <strong>
                        {formatPrice(
                          booking.estimatedFare
                        )}
                      </strong>

                    </div>

                    <div className="field">

                      <small>
                        BOOKING STATUS
                      </small>

                      <strong>
                        {booking.status}
                      </strong>

                    </div>

                  </div>

                  {/* KM Allowance */}

                  {allowedKm !== null && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "18px",
                        borderRadius: "14px",
                        background: "#f7f7f7",
                        border: "1px solid #eeeeee"
                      }}
                    >

                      <small>
                        DISTANCE ALLOWANCE
                      </small>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "8px"
                        }}
                      >

                        <span className="muted">
                          Included distance
                        </span>

                        <strong>
                          {allowedKm.toLocaleString("en-IN")} km
                        </strong>

                      </div>

                    </div>
                  )}

                  {/* Start trip information */}

                  {booking.actualStartTime && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderRadius: "14px",
                        background: "#f7f7f7"
                      }}
                    >

                      <small>
                        TRIP STARTED
                      </small>

                      <div
                        style={{
                          marginTop: "5px"
                        }}
                      >
                        {formatDate(
                          booking.actualStartTime
                        )}
                      </div>

                      {booking.startOdometer !== null &&
                        booking.startOdometer !== undefined && (
                          <div
                            className="muted"
                            style={{
                              marginTop: "5px"
                            }}
                          >
                            Starting odometer:{" "}
                            {booking.startOdometer}
                          </div>
                        )}

                    </div>
                  )}

                  {/* End trip information */}

                  {booking.actualEndTime && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "18px",
                        borderRadius: "14px",
                        background: "#f7f7f7"
                      }}
                    >

                      <small>
                        TRIP COMPLETED
                      </small>

                      <div
                        style={{
                          marginTop: "5px"
                        }}
                      >
                        {formatDate(
                          booking.actualEndTime
                        )}
                      </div>

                      {booking.endOdometer !== null &&
                        booking.endOdometer !== undefined && (
                          <div
                            className="muted"
                            style={{
                              marginTop: "5px"
                            }}
                          >
                            Ending odometer:{" "}
                            {booking.endOdometer}
                          </div>
                        )}

                      {distanceKm !== null && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "12px"
                          }}
                        >
                          <span>
                            Distance travelled
                          </span>

                          <strong>
                            {distanceKm.toLocaleString("en-IN")} km
                          </strong>
                        </div>
                      )}

                      {allowedKm !== null && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "10px"
                          }}
                        >
                          <span>
                            Allowed distance
                          </span>

                          <strong>
                            {allowedKm.toLocaleString("en-IN")} km
                          </strong>
                        </div>
                      )}

                      {extraKm !== null && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "10px"
                          }}
                        >
                          <span>
                            Extra distance
                          </span>

                          <strong>
                            {extraKm.toLocaleString("en-IN")} km
                          </strong>
                        </div>
                      )}

                      {extraKmRate !== null && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "10px"
                          }}
                        >
                          <span>
                            Extra KM rate
                          </span>

                          <strong>
                            {formatPrice(extraKmRate)}/km
                          </strong>
                        </div>
                      )}

                      {extraKmCharge !== null && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid #e5e5e5"
                          }}
                        >
                          <strong>
                            Extra KM charge
                          </strong>

                          <strong>
                            {formatPrice(extraKmCharge)}
                          </strong>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Extra KM warning */}

                  {hasExtraKm && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "16px",
                        borderRadius: "14px",
                        background: "#fff4cc",
                        border: "1px solid #f0d36b"
                      }}
                    >

                      <strong>
                        Extra distance charge
                      </strong>

                      <p
                        className="muted"
                        style={{
                          marginTop: "6px",
                          marginBottom: "0"
                        }}
                      >
                        You travelled{" "}
                        {extraKm.toLocaleString("en-IN")} km
                        beyond the included distance.
                        An additional{" "}
                        {formatPrice(extraKmCharge)}
                        {" "}has been added to your final fare.
                      </p>

                    </div>
                  )}

                  {/* Final fare */}

                  {booking.finalFare !== null &&
                    booking.finalFare !== undefined && (

                      <div
                        style={{
                          marginTop: "20px",
                          padding: "18px",
                          borderRadius: "14px",
                          background: hasExtraKm
                            ? "#fff4cc"
                            : "#eef8ee"
                        }}
                      >

                        <small>
                          FINAL FARE
                        </small>

                        <h3
                          style={{
                            marginTop: "5px",
                            marginBottom: "0",
                            fontSize: "24px"
                          }}
                        >
                          {formatPrice(
                            booking.finalFare
                          )}
                        </h3>

                        {hasExtraKm && (
                          <div
                            className="muted"
                            style={{
                              marginTop: "6px"
                            }}
                          >
                            Includes{" "}
                            {formatPrice(extraKmCharge)}
                            {" "}extra KM charges
                          </div>
                        )}

                      </div>
                    )}

                  {/* Actions */}

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "25px",
                      flexWrap: "wrap"
                    }}
                  >

                    {vehicle && (
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="secondary-btn"
                      >
                        View vehicle
                      </Link>
                    )}

                    {/* CONFIRMED → START TRIP */}

                    {booking.status ===
                      "CONFIRMED" && (

                      <button
                        className="primary-btn"
                        disabled={isActionLoading}
                        onClick={() =>
                          handleStartTrip(
                            booking.id
                          )
                        }
                      >
                        {isActionLoading
                          ? "Starting..."
                          : "Start trip"}
                      </button>
                    )}

                    {/* ONGOING → END TRIP */}

                    {booking.status ===
                      "ONGOING" && (

                      <button
                        className="primary-btn"
                        disabled={isActionLoading}
                        onClick={() =>
                          handleEndTrip(
                            booking.id
                          )
                        }
                      >
                        {isActionLoading
                          ? "Ending..."
                          : "End trip"}
                      </button>
                    )}

                    {/* CANCEL */}

                    {(booking.status ===
                      "PENDING" ||
                      booking.status ===
                        "CONFIRMED") && (

                      <button
                        className="secondary-btn"
                        disabled={isActionLoading}
                        onClick={() =>
                          handleCancel(
                            booking.id
                          )
                        }
                      >
                        {isActionLoading
                          ? "Please wait..."
                          : "Cancel booking"}
                      </button>
                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

    </section>
  );
}