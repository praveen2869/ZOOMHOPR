import { useState } from "react";
import { Link } from "react-router-dom";
import { searchRides } from "../api";

export default function Rides() {
  const [originLabel, setOriginLabel] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [date, setDate] = useState("");
  const [earliestDepartureTime, setEarliestDepartureTime] = useState("");
  const [latestDepartureTime, setLatestDepartureTime] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const buildDateTime = (selectedDate, selectedTime) => {
    if (!selectedDate || !selectedTime) return undefined;
    return new Date(`${selectedDate}T${selectedTime}`).toISOString();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const data = await searchRides({
        lat: lat === "" ? undefined : Number(lat),
        lng: lng === "" ? undefined : Number(lng),
        radiusKm: radiusKm === "" ? undefined : Number(radiusKm),
        earliestDeparture: buildDateTime(date, earliestDepartureTime),
        latestDeparture: buildDateTime(date, latestDepartureTime),
        originLabel: originLabel || undefined,
        destinationLabel: destinationLabel || undefined,
      });
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to search rides.");
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section dark">
      <div className="section-head">
        <div>
          <div className="eyebrow">Carpool</div>
          <h1>Find a ride</h1>
          <p className="section-copy">
            Search shared rides by time and pickup area.
          </p>
        </div>
      </div>

      <form className="car-card" onSubmit={handleSearch} style={{ display: "grid", gap: 12 }}>
        <div className="car-info" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label>
            <div>Origin location</div>
            <input className="full" value={originLabel} onChange={(e) => setOriginLabel(e.target.value)} placeholder="Pickup area" />
          </label>
          <label>
            <div>Destination location</div>
            <input className="full" value={destinationLabel} onChange={(e) => setDestinationLabel(e.target.value)} placeholder="Dropoff area" />
          </label>
          <label>
            <div>Origin latitude</div>
            <input className="full" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 6.5244" />
          </label>
          <label>
            <div>Origin longitude</div>
            <input className="full" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g. 3.3792" />
          </label>
          <label>
            <div>Date</div>
            <input className="full" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            <div>Earliest departure time</div>
            <input className="full" type="time" value={earliestDepartureTime} onChange={(e) => setEarliestDepartureTime(e.target.value)} />
          </label>
          <label>
            <div>Latest departure time</div>
            <input className="full" type="time" value={latestDepartureTime} onChange={(e) => setLatestDepartureTime(e.target.value)} />
          </label>
          <label>
            <div>Radius (km)</div>
            <input className="full" type="number" min="1" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} />
          </label>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search rides"}
          </button>
          <Link className="secondary-btn" to="/my-rides">
            My ride requests
          </Link>
        </div>
        {error ? <p style={{ color: "#ffb4b4", margin: 0 }}>{error}</p> : null}
      </form>

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {loading ? <div className="car-card">Loading rides...</div> : null}
        {!loading && searched && !error && rides.length === 0 ? (
          <div className="car-card">No rides found for your search.</div>
        ) : null}
        {!loading && rides.map((ride) => (
          <article className="car-card" key={ride.offerId}>
            <div className="car-info">
              <h3 style={{ marginTop: 0 }}>{ride.originLabel || "Unknown origin"} → {ride.destinationLabel || "Unknown destination"}</h3>
              <p><strong>Departure:</strong> {ride.departureTime ? new Date(ride.departureTime).toLocaleString() : "N/A"}</p>
              <p><strong>Available seats:</strong> {ride.availableSeats ?? "N/A"}</p>
              <p><strong>Price per seat:</strong> {ride.pricePerSeat ?? "N/A"}</p>
              <p><strong>Status:</strong> <span className="pill">{ride.status || "UNKNOWN"}</span></p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link className="dark-btn" to={`/rides/${ride.offerId}`}>
                View ride
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}