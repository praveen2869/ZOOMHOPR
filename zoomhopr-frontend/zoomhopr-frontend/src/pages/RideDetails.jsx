import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRideOffer, requestToJoinRide } from "../api";

export default function RideDetails() {
  const { id } = useParams();
  const [ride, setRide] = useState(null);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRide = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRideOffer(id);
      setRide(data || null);
    } catch (err) {
      setError(err.message || "Unable to load ride details.");
      setRide(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRide();
  }, [id]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await requestToJoinRide(id, Number(seatsRequested));
      setSuccess("Seat request submitted successfully.");
      await loadRide();
    } catch (err) {
      setError(err.message || "Unable to request a seat.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <section className="section dark"><div className="car-card">Loading ride details...</div></section>;
  }

  if (error && !ride) {
    return <section className="section dark"><div className="car-card">{error}</div></section>;
  }

  return (
    <section className="section dark">
      <div className="section-head">
        <div>
          <div className="eyebrow">Carpool</div>
          <h1>Ride details</h1>
        </div>
        <Link className="text-link" to="/rides">
          Back to rides
        </Link>
      </div>

      <div className="car-card">
        <div className="car-info">
          <h3 style={{ marginTop: 0 }}>{ride?.originLabel || "Unknown origin"} → {ride?.destinationLabel || "Unknown destination"}</h3>
          <p><strong>Departure time:</strong> {ride?.departureTime ? new Date(ride.departureTime).toLocaleString() : "N/A"}</p>
          <p><strong>Available seats:</strong> {ride?.availableSeats ?? "N/A"}</p>
          <p><strong>Price per seat:</strong> {ride?.pricePerSeat ?? "N/A"}</p>
          <p><strong>Recurring:</strong> {ride?.recurring ? "Yes" : "No"}</p>
          <p><strong>Status:</strong> <span className="pill">{ride?.status || "UNKNOWN"}</span></p>
        </div>
      </div>

      <form className="car-card" onSubmit={handleRequest} style={{ marginTop: 24, display: "grid", gap: 12 }}>
        <div className="section-head" style={{ marginBottom: 0 }}>
          <div>
            <h2 style={{ marginBottom: 0 }}>Request a seat</h2>
          </div>
        </div>
        <label>
          <div>Seats requested</div>
          <input
            className="full"
            type="number"
            min="1"
            value={seatsRequested}
            onChange={(e) => setSeatsRequested(e.target.value)}
          />
        </label>
        <div>
          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </div>
        {success ? <p style={{ color: "#8fe3b0", margin: 0 }}>{success}</p> : null}
        {error ? <p style={{ color: "#ffb4b4", margin: 0 }}>{error}</p> : null}
      </form>
    </section>
  );
}