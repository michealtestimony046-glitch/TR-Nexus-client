import React, { useState, useEffect } from "react";

const ADMIN_KEY = "tr_admin_session";

function getAdminKey() {
  return localStorage.getItem(ADMIN_KEY) || "";
}
function saveAdminKey(pw) {
  localStorage.setItem(ADMIN_KEY, pw);
}
function clearAdminKey() {
  localStorage.removeItem(ADMIN_KEY);
}

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const map = {
    active:      { label: "ACTIVE",      color: "#38bdf8" },
    "in-analysis": { label: "IN ANALYSIS", color: "#a78bfa" },
    completed:   { label: "COMPLETED",   color: "#4ade80" },
    cancelled:   { label: "CANCELLED",   color: "#6b7280" },
  };
  const s = map[status] || { label: status.toUpperCase(), color: "#6b7280" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      color: s.color, border: `1px solid ${s.color}33`,
      background: `${s.color}11`, borderRadius: 4, padding: "2px 8px",
    }}>
      {status === "active" && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: s.color, display: "inline-block",
          animation: "pulse-ring 1.5s infinite",
        }} />
      )}
      {s.label}
    </span>
  );
}

function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/projects/all", {
      headers: { "x-admin-key": pw },
    });
    const data = await res.json();
    if (data.ok) {
      saveAdminKey(pw);
      onLogin(pw);
    } else {
      setError("Invalid admin password.");
    }
    setLoading(false);
  }

  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg, #0a0a0a)", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
        borderRadius: 12, padding: 32,
      }}>
        <div style={{ fontSize: 11, color: "var(--accent, #38bdf8)", letterSpacing: "0.1em", marginBottom: 8 }}>
          // Admin Access
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
          T/R Agency Admin
        </h2>
        <p style={{ margin: "0 0 24px", color: "var(--muted, #666)", fontSize: 14 }}>
          Enter your admin password to access the control panel.
        </p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted, #666)", marginBottom: 6, fontWeight: 600 }}>
              Admin Password
            </label>
            <input
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "var(--bg, #0a0a0a)", border: "1px solid var(--border, #222)",
                borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          {error && (
            <div style={{
              background: "#ff444411", border: "1px solid #ff444433",
              borderRadius: 8, padding: "10px 14px", color: "#ff6b6b",
              fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 8,
              background: "var(--accent, #38bdf8)", color: "#000",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying…" : "Access Control Panel"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function Admin() {
  const [adminPw, setAdminPw] = useState(getAdminKey());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");

  async function loadProjects(pw) {
    setLoading(true);
    const res = await fetch("/api/projects/all", {
      headers: { "x-admin-key": pw },
    });
    const data = await res.json();
    if (data.ok) setProjects(data.projects);
    setLoading(false);
  }

  useEffect(() => {
    if (adminPw) loadProjects(adminPw);
  }, [adminPw]);

  async function updateStatus(id, status) {
    setUpdating(id);
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminPw,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.ok) {
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    }
    setUpdating(null);
  }

  function handleLogout() {
    clearAdminKey();
    setAdminPw("");
    setProjects([]);
  }

  if (!adminPw) return <AdminLogin onLogin={(pw) => setAdminPw(pw)} />;

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const counts = {
    all: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    "in-analysis": projects.filter((p) => p.status === "in-analysis").length,
    completed: projects.filter((p) => p.status === "completed").length,
    cancelled: projects.filter((p) => p.status === "cancelled").length,
  };

  return (
    <section style={{
      minHeight: "100vh", background: "var(--bg, #0a0a0a)",
      padding: "24px 16px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 32, flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--accent, #38bdf8)", letterSpacing: "0.1em", marginBottom: 4 }}>
              // Admin Control Panel
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>
              T/R Agency — Operations
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => loadProjects(adminPw)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border, #222)",
                background: "transparent", color: "#fff", fontSize: 13, cursor: "pointer",
              }}
            >
              ↻ Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid #ff444433",
                background: "#ff444411", color: "#ff6b6b", fontSize: 13, cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12, marginBottom: 24,
        }}>
          {[
            { label: "Total", value: counts.all, color: "#fff" },
            { label: "Active", value: counts.active, color: "#38bdf8" },
            { label: "In Analysis", value: counts["in-analysis"], color: "#a78bfa" },
            { label: "Completed", value: counts.completed, color: "#4ade80" },
            { label: "Cancelled", value: counts.cancelled, color: "#6b7280" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--muted, #666)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["all", "active", "in-analysis", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${filter === f ? "var(--accent, #38bdf8)" : "var(--border, #222)"}`,
                background: filter === f ? "var(--accent, #38bdf8)22" : "transparent",
                color: filter === f ? "var(--accent, #38bdf8)" : "var(--muted, #666)",
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {f === "all" ? `All (${counts.all})` : f === "in-analysis" ? `In Analysis (${counts["in-analysis"]})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Projects table */}
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--muted, #666)", padding: 60 }}>
            Loading projects…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", color: "var(--muted, #666)", padding: 60,
            background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
            borderRadius: 12,
          }}>
            No projects found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((p) => (
              <div key={p.id} style={{
                background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", flexWrap: "wrap", gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent, #38bdf8)", fontFamily: "monospace" }}>
                        {p.id}
                      </span>
                      <StatusBadge status={p.status || "active"} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                      {p.service}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted, #666)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span>👤 {p.name}</span>
                      <span>✉ {p.email}</span>
                      <span>🕐 {fmt(p.submittedAt)}</span>
                      {p.price && p.price !== "—" && <span>💰 {p.price}</span>}
                    </div>
                    {p.mainIssue && (
                      <div style={{
                        marginTop: 8, fontSize: 12, color: "var(--muted, #888)",
                        background: "#ffffff08", borderRadius: 6, padding: "6px 10px",
                        borderLeft: "2px solid var(--border, #222)",
                      }}>
                        {p.mainIssue.slice(0, 120)}{p.mainIssue.length > 120 ? "…" : ""}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {(p.status === "active" || !p.status) && (
                      <button
                        onClick={() => updateStatus(p.id, "in-analysis")}
                        disabled={updating === p.id}
                        style={{
                          padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                          border: "1px solid #a78bfa44", background: "#a78bfa11",
                          color: "#a78bfa", cursor: "pointer",
                          opacity: updating === p.id ? 0.6 : 1,
                        }}
                      >
                        ▶ Start Analysis
                      </button>
                    )}
                    {p.status === "in-analysis" && (
                      <button
                        onClick={() => updateStatus(p.id, "completed")}
                        disabled={updating === p.id}
                        style={{
                          padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                          border: "1px solid #4ade8044", background: "#4ade8011",
                          color: "#4ade80", cursor: "pointer",
                          opacity: updating === p.id ? 0.6 : 1,
                        }}
                      >
                        ✅ Mark Delivered
                      </button>
                    )}
                    {p.status === "completed" && (
                      <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>
                        ✓ Delivered
                      </span>
                    )}
                    {p.status === "cancelled" && (
                      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
                        ✕ Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
