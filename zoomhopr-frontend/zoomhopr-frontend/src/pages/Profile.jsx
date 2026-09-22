import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api";

export default function Profile({ user, setUser }) {
  const [form, setForm] = useState({ fullName: "", profileImageUrl: null, licenseNumber: null, licenseImageUrl: null });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProfile().then(p => {
      setUser(p);
      setForm(f => ({ ...f, fullName: p.fullName || "" }));
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    const p = await updateProfile(form);
    setUser(p);
    setMessage("Profile updated successfully.");
  }

  return (
    <section className="dashboard-page narrow">
      <div className="page-title"><p className="eyebrow dark">ACCOUNT</p><h1>Your profile</h1><p className="muted">Manage your identity and trip profile.</p></div>
      <form className="profile-card" onSubmit={save}>
        <div className="profile-avatar">{(form.fullName || "U").slice(0,1).toUpperCase()}</div>
        <label>Full name</label>
        <input value={form.fullName} onChange={e => setForm({...form, fullName:e.target.value})} placeholder="Your full name" />
        <label>Email</label>
        <input value={localStorage.getItem("email") || ""} disabled />
        <label>User ID</label>
        <input value={user?.userId || localStorage.getItem("userId") || ""} disabled />
        <button className="primary-btn" type="submit">Save profile</button>
        {message && <div className="success-box">{message}</div>}
      </form>
    </section>
  );
}