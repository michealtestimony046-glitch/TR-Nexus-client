import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveSession } from "../auth.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Landing page for OAuth redirects (GitHub / Google).
 * The backend redirects here with ?token=...&name=...&email=...&expiresAt=...
 * We save the session and bounce to /portal.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token     = params.get("token");
    const name      = params.get("name");
    const email     = params.get("email");
    const expiresAt = params.get("expiresAt");
    const err       = params.get("error");

    if (err) {
      setError(decodeURIComponent(err).replace(/_/g, " "));
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    if (!token || !email) {
      setError("Incomplete session data from OAuth provider.");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    saveSession({ token, name, email, expiresAt: Number(expiresAt) });
    refresh();
    navigate("/portal", { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#040810", color: "#e6edf7", fontFamily: "system-ui, sans-serif",
      gap: 16,
    }}>
      {error ? (
        <>
          <div style={{ color: "#f87171", fontSize: 16, maxWidth: 320, textAlign: "center" }}>
            {error}
          </div>
          <div style={{ fontSize: 13, color: "#5c6781" }}>Redirecting to login…</div>
        </>
      ) : (
        <>
          <div style={{
            width: 36, height: 36, border: "3px solid rgba(56,189,248,0.3)",
            borderTop: "3px solid #38bdf8", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, color: "#8b97ad" }}>Completing sign-in…</div>
        </>
      )}
    </div>
  );
}
