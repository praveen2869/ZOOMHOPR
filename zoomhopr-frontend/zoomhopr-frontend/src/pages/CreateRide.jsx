import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRideOffer, getVehiclesByOwner } from "../api";

export default function CreateRide() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    vehicleId: "",
    originLabel: "",
    originLat: "",
    originLng: "",
    destinationLabel: "",
    destinationLat: "",
    destinationLng: "",
    departureTime: "",
    availableSeats: "",
    pricePerSeat: "",
    recurring: false,
  });

  useEffect(() => {
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      setError("");

      try {
        const data = await getVehiclesByOwner(userId);
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load your vehicles.");
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, [userId]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createRideOffer({
        vehicleId: Number(form.vehicleId),
        originLat: Number(form.originLat),
        originLng: Number(form.originLng),
        originLabel: form.originLabel,
        destinationLat: Number(form.destinationLat),
        destinationLng: Number(form.destinationLng),
        destinationLabel: form.destinationLabel,
        departureTime: new Date(form.departureTime).toISOString(),
        availableSeats: Number(form.availableSeats),
        pricePerSeat: Number(form.pricePerSeat),
        recurring: Boolean(form.recurring),
      });
      navigate("/host/rides");
    } catch (err) {
      setError(err.message || "Unable to create ride offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section dark">
      <div className="section-head">
        <div>
          <div className="eyebrow">Host</div>
          <h1>Offer a ride</h1>
        </div>
      </div>

      {error ? <p style={{ color: "#ffb4b4" }}>{error}</p> : null}
      {loadingVehicles ? <div className="car-card">Loading your vehicles...</div> : null}
      {!loadingVehicles && vehicles.length === 0 ? (
        <div className="car-card">You need at least one vehicle before offering a ride.</div>
      ) : null}

      {!loadingVehicles && vehicles.length > 0 ? (
        <form className="car-card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Vehicle</div>
            <select className="full" value={form.vehicleId} onChange={(e) => handleChange("vehicleId", e.target.value)} required>
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.vehicleId || vehicle.id} value={vehicle.vehicleId || vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.plateNumber || vehicle.registrationNumber || vehicle.vehicleId || vehicle.id})
                </option>
              ))}
            </select>
          </label>
          <label>
            <div>Origin label</div>
            <input className="full" value={form.originLabel} onChange={(e) => handleChange("originLabel", e.target.value)} required />
          </label>
          <label>
            <div>Origin latitude</div>
            <input className="full" type="number" step="any" value={form.originLat} onChange={(e) => handleChange("originLat", e.target.value)} required />
          </label>
          <label>
            <div>Origin longitude</div>
            <input className="full" type="number" step="any" value={form.originLng} onChange={(e) => handleChange("originLng", e.target.value)} required />
          </label>
          <label>
            <div>Destination label</div>
            <input className="full" value={form.destinationLabel} onChange={(e) => handleChange("destinationLabel", e.target.value)} required />
          </label>
          <label>
            <div>Destination latitude</div>
            <input className="full" type="number" step="any" value={form.destinationLat} onChange={(e) => handleChange("destinationLat", e.target.value)} required />
          </label>
          <label>
            <div>Destination longitude</div>
            <input className="full" type="number" step="any" value={form.destinationLng} onChange={(e) => handleChange("destinationLng", e.target.value)} required />
          </label>
          <label>
            <div>Departure date and time</div>
            <input className="full" type="datetime-local" value={form.departureTime} onChange={(e) => handleChange("departureTime", e.target.value)} required />
          </label>
          <label>
            <div>Available seats</div>
            <input className="full" type="number" min="1" value={form.availableSeats} onChange={(e) => handleChange("availableSeats", e.target.value)} required />
          </label>
          <label>
            <div>Price per seat</div>
            <input className="full" type="number" min="0" step="0.01" value={form.pricePerSeat} onChange={(e) => handleChange("pricePerSeat", e.target.value)} required />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.recurring} onChange={(e) => handleChange("recurring", e.target.checked)} />
            <span>Recurring ride</span>
          </label>
          <div>
            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create ride offer"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}