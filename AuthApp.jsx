import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import App from "./PanthersTracker";

const NAVY = "#000000";
const BLUE = "#5F8DB5";

export default function AuthApp() {
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (session === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Inter', sans-serif", color: NAVY }}>
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", height: "100vh",
        background: "#F4F3EF", fontFamily: "'Inter', sans-serif", padding: 20
      }}>
        <form onSubmit={handleLogin} style={{
          background: "#fff", borderRadius: 12, padding: 32, width: "100%", maxWidth: 340,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 14
        }}>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 22, color: NAVY }}>PANTHERS TRACKER</div>
            <div style={{ fontSize: 12.5, color: "#8A8F98", marginTop: 2 }}>Sign in to continue</div>
          </div>
          <input
            type="email" placeholder="Email" value={email} required
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #D5D5D5", fontSize: 14 }}
          />
          <input
            type="password" placeholder="Password" value={password} required
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #D5D5D5", fontSize: 14 }}
          />
          {error && <div style={{ fontSize: 12.5, color: "#000" }}>{error}</div>}
          <button
            type="submit" disabled={loading}
            style={{
              background: NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px",
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif"
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <div style={{ fontSize: 11.5, color: "#B0B5BC", textAlign: "center" }}>
            Accounts are created in the Supabase dashboard under Authentication → Users.
          </div>
        </form>
      </div>
    );
  }

  return <App onSignOut={handleSignOut} />;
}
