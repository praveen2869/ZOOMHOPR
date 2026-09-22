import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { acceptRideRequest, getHostedRideRequests, rejectRideRequest } from "../api";

export default function RideRequests() {
  const { offerId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getHostedRideRequests(offerId);
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
  }, [offerId]);

  const handleAction = async (requestId, action) => {
    setError("");
    setSuccess("");

    try {
      if (action === "accept") {
        await acceptRideRequest(requestId);
        setSuccess("Ride request accepted.");
      } else {
        await rejectRideRequest(requestId);
        setSuccess("Ride request rejected.");
      }
      await loadRequests();
    } catch (err) {
      setError(err.message || "Unable to update ride request.");
    }
  };

  return (
    <section className="section dark">
      <div className="section-head">
        <div>
          <div className="eyebrow">Host</div>
          <h1>Ride requests</h1>
        </div>
      </div>

      {success ? <p style={{ color: "#8fe3b0" }}>{success}</p> : null}
      {error ? <p style={{ color: "#ffb4b4" }}>{error}</p> : null}
      {loading ? <div className="car-card">Loading ride requests...</div> : null}
      {!loading && requests.length === 0 ? <div className="car-card">No ride requests for this offer yet.</div> : null}

      <div style={{ display: "grid", gap: 16 }}>
        {requests.map((request) => {
          const requestId = request.requestId || request.id;

          return (
            <article className="car-card" key={requestId}>
              <div className="car-info">
                <h3 style={{ marginTop: 0 }}>Request #{requestId}</h3>
                <p><strong>Rider ID:</strong> {request.riderId ?? request.userId ?? "N/A"}</p>
                <p><strong>Seats requested:</strong> {request.seatsRequested ?? "N/A"}</p>
                <p><strong>Status:</strong> <span className="pill">{request.status || "UNKNOWN"}</span></p>
                <p><strong>Created:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleString() : "N/A"}</p>
              </div>
              {request.status === "PENDING" ? (
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button type="button" className="primary-btn" onClick={() => handleAction(requestId, "accept")}>
                    Accept
                  </button>
                  <button type="button" className="dark-btn" onClick={() => handleAction(requestId, "reject")}>
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}