import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelRideOffer, getMyHostedRides } from "../api";

export default function HostRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRides = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyHostedRides();
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load hosted rides.");
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const handleCancel = async (offerId) => {
    const confirmed = window.confirm("Cancel this ride offer?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await cancelRideOffer(offerId);
      setSuccess("Ride offer cancelled.");
      await loadRides();
    } catch (err) {
      setError(err.message || "Unable to cancel ride offer.");
    }
  };

  return (
    <section className="section dark">
      <div className="section-head">
        <div>
          <div className="eyebrow">Host</div>
          <h1>My hosted rides</h1>
        </div>
        <Link className="primary-btn" to="/host/rides/new">
          + Offer a ride
        </Link>
      </div>

      {success ? <p style={{ color: "#8fe3b0" }}>{success}</p> : null}
      {error ? <p style={{ color: "#ffb4b4" }}>{error}</p> : null}
      {loading ? <div className="car-card">Loading hosted rides...</div> : null}
      {!loading && rides.length === 0 ? <div className="car-card">No rides offered yet.</div> : null}

      <div style={{ display: "grid", gap: 16 }}>
        {rides.map((ride) => {
          const rideId = ride.offerId || ride.id;
          const canCancel = ride.status !== "CANCELLED" && ride.status !== "COMPLETED";

          return (
            <article className="car-card" key={rideId}>
              <div className="car-info">
                <h3 style={{ marginTop: 0 }}>{ride.originLabel || "Unknown origin"} → {ride.destinationLabel || "Unknown destination"}</h3>
                <p><strong>Departure time:</strong> {ride.departureTime ? new Date(ride.departureTime).toLocaleString() : "N/A"}</p>
                <p><strong>Available seats:</strong> {ride.availableSeats ?? "N/A"}</p>
                <p><strong>Price per seat:</strong> {ride.pricePerSeat ?? "N/A"}</p>
                <p><strong>Status:</strong> <span className="pill">{ride.status || "UNKNOWN"}</span></p>
                <p><strong>Vehicle ID:</strong> {ride.vehicleId ?? "N/A"}</p>
                <p><strong>Recurring:</strong> {ride.recurring ? "Yes" : "No"}</p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link className="secondary-btn" to={`/rides/${rideId}`}>
                  View ride
                </Link>
                <Link className="dark-btn" to={`/host/rides/${rideId}/requests`}>
                  Manage requests
                </Link>
                {canCancel ? (
                  <button type="button" className="primary-btn" onClick={() => handleCancel(rideId)}>
                    Cancel ride
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}