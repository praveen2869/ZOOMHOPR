import React from "react";
import { Link } from "react-router-dom";

const cars = [
  { name: "Hyundai Creta", type: "SUV", price: "₹2,499", image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80", tag: "Guest favourite" },
  { name: "Mahindra Thar", type: "SUV", price: "₹3,199", image: "https://images.unsplash.com/photo-1625231334168-35067f8853e4?auto=format&fit=crop&w=900&q=80", tag: "Popular" },
  { name: "Honda City", type: "Sedan", price: "₹2,099", image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80", tag: "Great value" }
];

export default function Home({ user }) {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">BENGALURU • MOBILITY, REIMAGINED</p>
          <h1>Pick a car.<br/><span>Find your ride.</span></h1>
          <p className="hero-copy">Rent a car for the day or find a seat on a shared commute. One platform for getting where you need to go.</p>

          <div className="search-card">
            <div className="search-tabs">
              <button className="selected">Rent a car</button>
              <Link to="/rides">Carpool</Link>
            </div>
            <div className="search-grid">
              <div className="field"><small>PICKUP LOCATION</small><strong>📍 Bengaluru</strong><span>Choose a pickup point</span></div>
              <div className="field"><small>START</small><strong>Today · 10:00 AM</strong><span>Choose date & time</span></div>
              <div className="field"><small>END</small><strong>Tomorrow · 10:00 AM</strong><span>Choose date & time</span></div>
              <Link to="/vehicles" className="primary-btn search-btn">Search cars</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div><p className="eyebrow dark">READY WHEN YOU ARE</p><h2>Cars people love</h2></div>
          <Link to="/vehicles" className="text-link">View all →</Link>
        </div>
        <div className="car-grid">
          {cars.map(car => (
            <article className="car-card" key={car.name}>
              <div className="car-image" style={{backgroundImage:`url(${car.image})`}}>
                <span className="pill">{car.tag}</span>
              </div>
              <div className="car-info">
                <div><h3>{car.name}</h3><p>{car.type} · 5 seats · Automatic</p></div>
                <div className="price"><strong>{car.price}</strong><span>/ day</span></div>
              </div>
              <button className="secondary-btn full">View car</button>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div className="split-copy">
          <p className="eyebrow dark">MORE THAN A RENTAL</p>
          <h2>Your car. Your rules.<br/>Your extra income.</h2>
          <p>Have a car sitting idle? List it, set your availability and turn unused hours into earnings.</p>
          <button className="dark-btn">List your car</button>
        </div>
        <div className="split-visual">
          <div className="earning-card"><span>HOST EARNINGS</span><strong>₹18,420</strong><small>this month</small><div className="bar"><i/></div></div>
        </div>
      </section>

      <section className="section compact">
        <div className="section-head"><div><p className="eyebrow dark">HOW IT WORKS</p><h2>Simple from start to finish</h2></div></div>
        <div className="steps">
          <div><b>01</b><h3>Choose</h3><p>Pick a car or search for a ride that fits your route.</p></div>
          <div><b>02</b><h3>Book</h3><p>Confirm your timing, location and payment in a few taps.</p></div>
          <div><b>03</b><h3>Go</h3><p>Unlock, meet your ride and get moving.</p></div>
        </div>
      </section>

      <footer className="footer"><strong>zoomhopr</strong><span>Built for everyday movement.</span><span>© 2026</span></footer>
    </>
  );
}