import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("testuser@example.com");
  const [password, setPassword] = useState("Test@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="visual-overlay">
          <div className="eyebrow">YOUR CITY. YOUR RIDE.</div>
          <h1>Move freely.<br/><em>Go further.</em></h1>
          <p>Self-drive rentals and everyday carpooling, designed around the way you actually travel.</p>
          <div className="mini-stats">
            <span><b>24/7</b> mobility</span>
            <span><b>Verified</b> profiles</span>
            <span><b>Flexible</b> trips</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand"><span className="brand-mark">ZH</span> zoomhopr</div>
          <p className="eyebrow dark">WELCOME BACK</p>
          <h2>Let's get moving.</h2>
          <p className="muted">Sign in to book a car, find a ride or manage your trips.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={submit}>
            <label>Email address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />

            <div className="label-row">
              <label>Password</label>
              <button type="button" className="link-btn">Forgot?</button>
            </div>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />

            <button className="primary-btn full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="divider"><span>or</span></div>
          <button className="social-btn" type="button">Continue with Google</button>

          <p className="fine-print">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </section>
    </div>
  );
}