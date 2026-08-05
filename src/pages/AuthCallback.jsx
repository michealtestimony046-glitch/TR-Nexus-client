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
    console.log("AuthCallback: useEffect triggered");
    const token     = params.get("token");
    console.log("AuthCallback: token", token);
    const name      = params.get("name");
    console.log("AuthCallback: name", name);
    const email     = params.get("email");
    console.log("AuthCallback: email", email);
    const expiresAt = params.get("expiresAt");
    console.log("AuthCallback: expiresAt", expiresAt);
    const err       = params.get("error");
    console.log("AuthCallback: error param", err);

    if (err) {
      console.error("AuthCallback: OAuth error detected", err);
      setError(decodeURIComponent(err).replace(/_/g, " "));
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    if (!token || !email) {
      console.error("AuthCallback: Missing token or email");
      setError("Incomplete session data from OAuth provider.");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    console.log("AuthCallback: Saving session...");
    saveSession({ token, name, email, expiresAt: Number(expiresAt) });
    console.log("AuthCallback: Session saved.");
    console.log("AuthCallback: Refreshing auth context...");
    refresh();
    console.log("AuthCallback: Auth context refreshed.");
    console.log("AuthCallback: Navigating to /portal...");
    navigate("/portal", { replace: true });
    console.log("AuthCallback: Navigation initiated.");
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
