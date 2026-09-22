import { useEffect, useState } from "react";
import { getMyRideRequests, cancelRideRequest } from "../api";

export default function MyRides() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyRideRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load ride requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (requestId) => {
    const confirmed = window.confirm("Cancel this ride request?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await cancelRideRequest(requestId);
      setSuccess("Ride request cancelled.");
      await loadRequests();
    } catch (err) {
      setError(err.message || "Unable to cancel ride request.");
    }
  };

  return (
    <section className="section dark">
      <div className="section-head">
        <div>
          <div className="eyebrow">Carpool</div>
          <h1>My ride requests</h1>
        </div>
      </div>

      {success ? <p style={{ color: "#8fe3b0" }}>{success}</p> : null}
      {error ? <p style={{ color: "#ffb4b4" }}>{error}</p> : null}
      {loading ? <div className="car-card">Loading your ride requests...</div> : null}
      {!loading && requests.length === 0 ? <div className="car-card">No ride requests yet.</div> : null}

      <div style={{ display: "grid", gap: 16 }}>
        {requests.map((request) => {
          const canManage = request.status === "PENDING" || request.status === "ACCEPTED";

          return (
            <article className="car-card" key={request.requestId || request.id}>
              <div className="car-info">
                <h3 style={{ marginTop: 0 }}>Request #{request.requestId || request.id}</h3>
                <p><strong>Ride offer ID:</strong> {request.offerId ?? request.rideOfferId ?? "N/A"}</p>
                <p><strong>Seats requested:</strong> {request.seatsRequested ?? "N/A"}</p>
                <p><strong>Status:</strong> <span className="pill">{request.status || "UNKNOWN"}</span></p>
                <p><strong>Created:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleString() : "N/A"}</p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {canManage ? (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => window.alert("Ride request details page is not available yet.")}
                  >
                    View request
                  </button>
                ) : null}
                {canManage ? (
                  <button
                    type="button"
                    className="dark-btn"
                    onClick={() => handleCancel(request.requestId || request.id)}
                  >
                    Cancel request
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