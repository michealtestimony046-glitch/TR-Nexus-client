import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getSession } from "../auth.js";

async function fetchProjects() {
  const s = getSession();
  if (!s) return [];
  const res = await fetch("/api/projects", {
    headers: { Authorization: `Bearer ${s.token}` },
  });
  const data = await res.json();
  return data.ok ? data.projects : [];
}

async function cancelProject(id) {
  const s = getSession();
  if (!s) return { ok: false };
  const res = await fetch(`/api/projects/${id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${s.token}` },
  });
  return res.json();
}

async function acceptDelivery(id) {
  const s = getSession();
  if (!s) return { ok: false };
  const res = await fetch(`/api/projects/${id}/accept-delivery`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${s.token}` },
  });
  return res.json();
}

const DELIVERY = {
  "48-Hour App Health Scan": "48 hours",
  "Google Play Testing Compliance Service": "3–5 days",
  "Growth Leak Report": "3–5 days",
  "App Rescue Sprint": "7–14 days",
  "MVP Build Sprint": "14–21 days",
  "Performance Upgrade System": "7–10 days",
  "App Stability Shield": "Ongoing",
  "Growth Support Layer": "Ongoing",
};

const STATUS_CONFIG = {
  active:                { label: "ACTIVE — Team Notified",     color: "#38bdf8", pulse: true  },
  "in-analysis":         { label: "IN ANALYSIS",                color: "#a78bfa", pulse: true  },
  "pending-delivery":    { label: "PENDING DELIVERY",           color: "#ffaa00", pulse: true  },
  completed:             { label: "COMPLETED",                  color: "#4ade80", pulse: false },
  "pending-cancellation":{ label: "PENDING CANCELLATION",       color: "#ffaa00", pulse: true  },
  cancelled:             { label: "CANCELLED",                  color: "#6b7280", pulse: false },
};

function timelineSteps(project) {
  const t = new Date(project.submittedAt).getTime();
  const now = Date.now();
  const elapsed = now - t;
  const status = project.status || "active";

  const steps = [
    { label: "Project initialized",            detail: "System accepted your intake submission.",   doneAfter: 0         },
    { label: "Request received by T/R Agency", detail: "Our operations team has been notified.",    doneAfter: 5000      },
    { label: "Team notification sent",          detail: "Alert fired to #admin-leads channel.",      doneAfter: 30000     },
    { label: "Awaiting Discord session",        detail: "Open a ticket in the Command Center.",      doneAfter: 120000    },
    { label: "Analysis begins",                 detail: "Team reviews your project in detail.",      doneAfter: Infinity  },
    { label: "Report delivered",                detail: "Final deliverable sent to your account.",   doneAfter: Infinity  },
  ];

  return steps.map((s, i) => {
    let done = elapsed >= s.doneAfter;
    if (status === "in-analysis" && i <= 3) done = true;
    if (status === "pending-delivery" && i <= 4) done = true;
    if (status === "completed") done = true;
    return { ...s, done };
  });
}

function fmt(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status, large }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span className={`portal-active-badge${large ? " lg" : ""}`} style={{
      color: cfg.color,
      borderColor: `${cfg.color}33`,
      background: `${cfg.color}11`,
    }}>
      {cfg.pulse && <span className="pulse-dot" style={{ background: cfg.color }} />}
      {cfg.label}
    </span>
  );
}

function ProjectCard({ project, selected, onClick }) {
  const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
  return (
    <button
      className={`portal-card${selected ? " selected" : ""}`}
      onClick={onClick}
      style={project.status === "completed" ? { borderColor: "#4ade8033" } :
             project.status === "cancelled"  ? { borderColor: "#6b728033", opacity: 0.7 } :
             project.status === "pending-delivery" ? { borderColor: "#ffaa0033" } :
             project.status === "pending-cancellation" ? { borderColor: "#ffaa0033" } :
             project.status === "in-analysis" ? { borderColor: "#a78bfa33" } : {}}
    >
      <div className="portal-card-top">
        <span className="portal-project-id">{project.id}</span>
        <StatusBadge status={project.status} />
      </div>
      <div className="portal-card-svc">{project.service}</div>
      <div className="portal-card-meta">{fmt(project.submittedAt)}</div>
    </button>
  );
}

function Timeline({ project }) {
  const steps = timelineSteps(project);
  return (
    <div className="portal-timeline">
      <div className="portal-section-label">// Activity Timeline</div>
      {steps.map((step, i) => (
        <div key={i} className={`tl-step${step.done ? " done" : " pending"}`}>
          <div className="tl-line-wrap">
            <div className="tl-dot">
              {step.done ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              ) : null}
            </div>
            {i < steps.length - 1 && <div className="tl-connector" />}
          </div>
          <div className="tl-content">
            <div className="tl-label">{step.label}</div>
            <div className="tl-detail">{step.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsRow({ project }) {
  const delivery = DELIVERY[project.service] || "3–7 days";
  return (
    <div className="portal-stats">
      <div className="portal-stat">
        <div className="portal-stat-val">1</div>
        <div className="portal-stat-lbl">Active Project</div>
      </div>
      <div className="portal-stat-div" />
      <div className="portal-stat">
        <div className="portal-stat-val">{project.price !== "—" ? project.price : "Custom"}</div>
        <div className="portal-stat-lbl">Service Rate</div>
      </div>
      <div className="portal-stat-div" />
      <div className="portal-stat">
        <div className="portal-stat-val">{delivery}</div>
        <div className="portal-stat-lbl">Est. Delivery</div>
      </div>
    </div>
  );
}

function TrustBlock() {
  return (
    <div className="portal-trust">
      <div className="portal-section-label">// Security & Trust</div>
      <div className="portal-trust-grid">
        {[
          { icon: "🔒", label: "Your project is private and encrypted" },
          { icon: "⚡", label: "Average first response under 2 hours" },
          { icon: "🛡️", label: "Protected under T/R Agency client agreement" },
          { icon: "🌐", label: "Ops team active across USA · UK · NG" },
        ].map((item, i) => (
          <div key={i} className="portal-trust-item">
            <span className="portal-trust-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CancelModal({ project, onConfirm, onClose, cancelling }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000cc",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: "var(--surface, #111)", border: "1px solid #ff444433",
        borderRadius: 12, padding: 28, maxWidth: 400, width: "100%",
      }}>
        <div style={{ fontSize: 11, color: "#ff6b6b", letterSpacing: "0.1em", marginBottom: 8 }}>
          // Cancel Project
        </div>
        <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: 18 }}>
          Are you sure?
        </h3>
        <p style={{ margin: "0 0 8px", color: "var(--muted, #666)", fontSize: 14 }}>
          You are about to cancel:
        </p>
        <div style={{
          background: "#ffffff08", borderRadius: 8, padding: "10px 14px",
          marginBottom: 16, fontSize: 13, color: "#fff",
        }}>
          <strong>{project.id}</strong> — {project.service}
        </div>
        <p style={{ margin: "0 0 20px", color: "var(--muted, #666)", fontSize: 13 }}>
          Our team will be notified immediately and must approve the cancellation.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={cancelling}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8,
              border: "1px solid var(--border, #222)", background: "transparent",
              color: "#fff", fontSize: 13, cursor: "pointer",
            }}
          >
            Keep Project
          </button>
          <button
            onClick={onConfirm}
            disabled={cancelling}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8,
              border: "1px solid #ff444433", background: "#ff444411",
              color: "#ff6b6b", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: cancelling ? 0.6 : 1,
            }}
          >
            {cancelling ? "Requesting…" : "Request Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Portal() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!session) { navigate("/login", { replace: true }); return; }
    fetchProjects().then((p) => { setProjects(p); setLoading(false); });
  }, [session]);

  if (!session) return null;

  const active = projects[selected] || null;

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    const res = await cancelProject(cancelTarget.id);
    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) => p.id === cancelTarget.id ? { ...p, status: "pending-cancellation" } : p)
      );
    }
    setCancelling(false);
    setCancelTarget(null);
  }

  async function handleAcceptDelivery() {
    if (!active) return;
    setAccepting(true);
    const res = await acceptDelivery(active.id);
    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) => p.id === active.id ? { ...p, status: "completed" } : p)
      );
    }
    setAccepting(false);
  }

  return (
    <section className="portal-page page-pad-top">
      <div className="container">

        {/* Header */}
        <div className="portal-header">
          <div>
            <div className="section-tag">// Client Portal</div>
            <h2 className="portal-greeting">
              Welcome back, <span className="accent">{session.name.split(" ")[0]}</span>
            </h2>
          </div>
          <div className="portal-header-right">
            <span className="portal-status-pill"><span className="pulse-dot" />OPERATIONAL</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/login"); }}>
              Sign Out
            </button>
          </div>
        </div>

        {loading ? (
          <div className="portal-loading">
            <div className="portal-spinner" />
            <span>Loading operational data…</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="portal-empty">
            <div className="portal-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12h6M9 16h6M7 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M9 4a2 2 0 0 0 4 0M9 4a2 2 0 0 1 4 0"/>
              </svg>
            </div>
            <h3>No Active Projects</h3>
            <p>You haven't submitted a project intake yet. Initialize your first project to get started.</p>
            <Link className="btn btn-primary" to="/intake">
              Initialize First Project
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        ) : (
          <div className="portal-body">

            <div className="portal-cards-label">
              <div className="portal-section-label">// Active Projects ({projects.length})</div>
            </div>
            <div className="portal-cards-row">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} selected={i === selected} onClick={() => setSelected(i)} />
              ))}
            </div>

            {active && (
              <div className="portal-detail">
                <div className="portal-detail-header">
                  <div>
                    <div className="portal-detail-id">{active.id}</div>
                    <div className="portal-detail-svc">{active.service}</div>
                  </div>
                  <StatusBadge status={active.status} large />
                </div>

                <div className="portal-detail-grid">
                  <div className="portal-detail-left">
                    <Timeline project={active} />
                  </div>
                  <div className="portal-detail-right">
                    <StatsRow project={active} />
                    <TrustBlock />

                    {/* Accept Delivery button — only show when pending-delivery */}
                    {active.status === "pending-delivery" && (
                      <div style={{ marginTop: 20 }}>
                        <button
                          onClick={handleAcceptDelivery}
                          disabled={accepting}
                          style={{
                            width: "100%", padding: "10px 0", borderRadius: 8,
                            border: "1px solid #4ade8044", background: "#4ade8011",
                            color: "#4ade80", fontSize: 12, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.05em",
                            opacity: accepting ? 0.6 : 1,
                          }}
                        >
                          {accepting ? "Accepting…" : "✓ Accept Delivery"}
                        </button>
                      </div>
                    )}

                    {/* Cancel button — show if active, in-analysis, or pending-delivery */}
                    {(active.status === "active" || active.status === "in-analysis" || active.status === "pending-delivery") && (
                      <div style={{ marginTop: 20 }}>
                        <button
                          onClick={() => setCancelTarget(active)}
                          style={{
                            width: "100%", padding: "10px 0", borderRadius: 8,
                            border: "1px solid #ff444433", background: "#ff444408",
                            color: "#ff6b6b", fontSize: 12, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.05em",
                          }}
                        >
                          Cancel Project
                        </button>
                      </div>
                    )}

                    {active.status === "pending-cancellation" && (
                      <div style={{
                        marginTop: 20, padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #ffaa0033", background: "#ffaa0011",
                        color: "#ffaa00", fontSize: 13, textAlign: "center",
                      }}>
                        ⏳ Cancellation request pending admin approval
                      </div>
                    )}

                    {active.status === "completed" && (
                      <div style={{
                        marginTop: 20, padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #4ade8033", background: "#4ade8011",
                        color: "#4ade80", fontSize: 13, fontWeight: 700, textAlign: "center",
                      }}>
                        ✓ Project Completed — Thank you for working with T/R Agency
                      </div>
                    )}

                    {active.status === "cancelled" && (
                      <div style={{
                        marginTop: 20, padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #6b728033", background: "#6b728011",
                        color: "#6b7280", fontSize: 13, textAlign: "center",
                      }}>
                        ✕ This project was cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div className="portal-init-another">
            <div className="portal-section-label">// New Operation</div>
            <h3>Initialize Another Project</h3>
            <p>Ready to start a new engagement? Browse our services and submit a new intake.</p>
            <Link className="btn btn-outline" to="/services">
              Browse Services
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        )}

      </div>

      {cancelTarget && (
        <CancelModal
          project={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
          cancelling={cancelling}
        />
      )}

    </section>
  );
}
