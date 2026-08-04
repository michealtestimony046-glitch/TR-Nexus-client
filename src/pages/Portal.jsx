import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getSession, apiBase } from "../auth.js";
import ChatModal from "../components/ChatModal.jsx";

async function fetchProjects() {
  const s = getSession();
  if (!s) return [];
  const res = await fetch(`${apiBase}/api/projects`, {
    headers: { Authorization: `Bearer ${s.token}` },
  });
  const data = await res.json();
  return data.ok ? data.projects : [];
}

async function fetchMessages(projectId) {
  const s = getSession();
  if (!s) return [];
  const res = await fetch(`${apiBase}/api/projects/${projectId}/messages`, {
    headers: { Authorization: `Bearer ${s.token}` },
  });
  const data = await res.json();
  return data.ok ? data.messages : [];
}

async function cancelProject(id) {
  const s = getSession();
  if (!s) return { ok: false };
  const res = await fetch(`${apiBase}/api/projects/${id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${s.token}` },
  });
  return res.json();
}

async function acceptDelivery(id) {
  const s = getSession();
  if (!s) return { ok: false };
  const res = await fetch(`${apiBase}/api/projects/${id}/accept-delivery`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${s.token}` },
  });
  return res.json();
}

async function submitFeedback(id, rating, comment) {
  const s = getSession();
  if (!s) return { ok: false };
  const res = await fetch(`${apiBase}/api/projects/${id}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${s.token}`,
    },
    body: JSON.stringify({ rating, comment }),
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
  active:                 { label: "ACTIVE — Team Notified",   color: "#38bdf8", pulse: true  },
  "in-analysis":          { label: "IN ANALYSIS",              color: "#a78bfa", pulse: true  },
  "pending-delivery":     { label: "PENDING DELIVERY",         color: "#ffaa00", pulse: true  },
  completed:              { label: "COMPLETED",                color: "#4ade80", pulse: false },
  "pending-cancellation": { label: "PENDING CANCELLATION",     color: "#ffaa00", pulse: true  },
  cancelled:              { label: "CANCELLED",                color: "#6b7280", pulse: false },
};

// ── Timeline steps driven by BOTH elapsed time AND project status ──────────
function timelineSteps(project) {
  const elapsed = Date.now() - new Date(project.submittedAt).getTime();
  const status  = project.status || "active";
  const payment = project.payment;

  const steps = [
    {
      label: "Project initialized",
      detail: "System accepted your intake submission.",
      doneAfter: 0,
      statusDone: ["active","in-analysis","pending-delivery","completed","pending-cancellation","cancelled"],
    },
    {
      label: "Request received by T/R Agency",
      detail: "Our operations team has been notified.",
      doneAfter: 5000,
      statusDone: ["active","in-analysis","pending-delivery","completed","pending-cancellation","cancelled"],
    },
    {
      label: "Team notification sent",
      detail: "Alert fired to #admin-leads channel.",
      doneAfter: 30000,
      statusDone: ["active","in-analysis","pending-delivery","completed","pending-cancellation","cancelled"],
    },
    {
      label: "Awaiting project discussion",
      detail: "Start chatting in the Project Discussion below.",
      doneAfter: 120000,
      statusDone: ["in-analysis","pending-delivery","completed"],
    },
    {
      label: "Analysis in progress",
      detail: "Team is actively reviewing your project.",
      doneAfter: Infinity,
      statusDone: ["in-analysis","pending-delivery","completed"],
    },
    {
      label: "Payment confirmed",
      detail: "Your payment has been verified by the team.",
      doneAfter: Infinity,
      statusDone: [],
      // Special: done only when payment status is "paid"
      paymentDone: true,
    },
    {
      label: "Delivery pending your approval",
      detail: "Review and accept the final deliverable.",
      doneAfter: Infinity,
      statusDone: ["completed"],
    },
    {
      label: "Project completed",
      detail: "Delivery accepted. Thank you for working with T/R Agency!",
      doneAfter: Infinity,
      statusDone: ["completed"],
    },
  ];

  return steps.map((s) => {
    let done = false;

    if (s.paymentDone) {
      // Only mark done if payment is actually confirmed
      done = payment?.status === "paid";
    } else {
      // Done if status matches OR elapsed time passed
      done = s.statusDone.includes(status) || elapsed >= s.doneAfter;
    }

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

// ── Payment badge shown on project card ──────────────────────────────────────
function PaymentBadge({ payment }) {
  if (!payment?.status) return null;

  const map = {
    pending:  { label: "⏳ Payment Pending", color: "#38bdf8" },
    paid:     { label: "✅ Payment Success", color: "#4ade80" },
    rejected: { label: "❌ Payment Rejected", color: "#ff6b6b" },
  };
  const s = map[payment.status];
  if (!s) return null;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      color: s.color, border: `1px solid ${s.color}33`,
      background: `${s.color}11`, borderRadius: 4,
      padding: "2px 8px", marginTop: 4,
    }}>
      {s.label}
    </span>
  );
}

function ProjectCard({ project, selected, onClick }) {
  return (
    <button
      className={`portal-card${selected ? " selected" : ""}`}
      onClick={onClick}
      style={
        project.status === "completed"             ? { borderColor: "#4ade8033" } :
        project.status === "cancelled"             ? { borderColor: "#6b728033", opacity: 0.7 } :
        project.status === "pending-delivery"      ? { borderColor: "#ffaa0033" } :
        project.status === "pending-cancellation"  ? { borderColor: "#ffaa0033" } :
        project.status === "in-analysis"           ? { borderColor: "#a78bfa33" } : {}
      }
    >
      <div className="portal-card-top">
        <span className="portal-project-id">{project.id}</span>
        <StatusBadge status={project.status} />
      </div>
      <div className="portal-card-svc">{project.service}</div>
      <div className="portal-card-meta">{fmt(project.submittedAt)}</div>
      {/* Payment badge on card */}
      {project.payment?.status && (
        <div style={{ marginTop: 6 }}>
          <PaymentBadge payment={project.payment} />
        </div>
      )}
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
        <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: 18 }}>Are you sure?</h3>
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
          <button onClick={onClose} disabled={cancelling} style={{
            flex: 1, padding: "10px 0", borderRadius: 8,
            border: "1px solid var(--border, #222)", background: "transparent",
            color: "#fff", fontSize: 13, cursor: "pointer",
          }}>
            Keep Project
          </button>
          <button onClick={onConfirm} disabled={cancelling} style={{
            flex: 1, padding: "10px 0", borderRadius: 8,
            border: "1px solid #ff444433", background: "#ff444411",
            color: "#ff6b6b", fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: cancelling ? 0.6 : 1,
          }}>
            {cancelling ? "Requesting…" : "Request Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackModal({ project, onConfirm, onClose, submitting }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000cc",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: "var(--surface, #111)", border: "1px solid #ffaa0033",
        borderRadius: 12, padding: 28, maxWidth: 420, width: "100%",
      }}>
        <div style={{ fontSize: 11, color: "#ffaa00", letterSpacing: "0.1em", marginBottom: 8 }}>
          // Leave Feedback
        </div>
        <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: 18 }}>Rate your experience</h3>
        <p style={{ margin: "0 0 20px", color: "var(--muted, #666)", fontSize: 14 }}>
          How would you rate the service for {project.service}?
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 32,
                opacity: star <= (hoveredRating || rating) ? 1 : 0.3,
                transition: "opacity 0.2s",
              }}
            >
              ⭐
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--muted, #666)", marginBottom: 8 }}>
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved or what we can improve…"
            rows={4}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid var(--border, #222)", background: "#ffffff08",
              color: "#fff", fontSize: 13, fontFamily: "inherit", resize: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={submitting} style={{
            flex: 1, padding: "10px 0", borderRadius: 8,
            border: "1px solid var(--border, #222)", background: "transparent",
            color: "#fff", fontSize: 13, cursor: "pointer",
          }}>
            Skip for now
          </button>
          <button
            onClick={() => { if (rating > 0) onConfirm(rating, comment); }}
            disabled={rating === 0 || submitting}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8,
              border: "1px solid #ffaa0044", background: "#ffaa0011",
              color: "#ffaa00", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: rating === 0 || submitting ? 0.5 : 1,
            }}
          >
            {submitting ? "Submitting…" : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Portal ───────────────────────────────────────────────────────────────
export default function Portal() {
  const { session, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [projects,          setProjects         ] = useState([]);
  const [selected,          setSelected         ] = useState(0);
  const [loading,           setLoading          ] = useState(true);
  const [cancelTarget,      setCancelTarget     ] = useState(null);
  const [cancelling,        setCancelling       ] = useState(false);
  const [accepting,         setAccepting        ] = useState(false);
  const [feedbackTarget,    setFeedbackTarget   ] = useState(null);
  const [submittingFeedback,setSubmittingFeedback] = useState(false);
  const [showChatModal,     setShowChatModal    ] = useState(false);
  const [messages,          setMessages         ] = useState([]);
  const [unreadCount,       setUnreadCount      ] = useState(0);

  // Guard so the auto-open-from-intake effect only ever fires ONCE per visit,
  // even though `projects` gets a new array reference every 10s from polling.
  const autoOpenedRef = useRef(false);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) { navigate("/login", { replace: true }); return; }
    fetchProjects().then((p) => { setProjects(p); setLoading(false); });
  }, [session]);

  // ── Auto-open chat from Intake redirect (FIXED — was looping every 10s) ──
  // BUG: previously used window.history.replaceState() to "clear" the nav
  // state, but that does NOT update React Router's internal location object.
  // So location.state.openChat stayed truthy forever, and every time the
  // 10-second project poll produced a new `projects` array reference, this
  // effect re-ran and force-reopened the chat modal — even after the user
  // had manually closed it. Fixed by using React Router's own navigate()
  // to actually clear the state, plus a one-time ref guard as a safety net.
  useEffect(() => {
    if (
      !loading &&
      !autoOpenedRef.current &&
      location.state?.openChat &&
      location.state?.projectId &&
      projects.length > 0
    ) {
      const idx = projects.findIndex((p) => p.id === location.state.projectId);
      if (idx !== -1) {
        setSelected(idx);
        setShowChatModal(true);
      }
      autoOpenedRef.current = true;
      // Properly clear the router's location state (not just the URL bar)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [loading, projects, location.state, location.pathname, navigate]);

  // ── Auto-refresh projects every 10 seconds ────────────────────────────────
  useEffect(() => {
    if (!session) return;

    // Fetch immediately on mount too
    fetchProjects().then((p) => setProjects(p));

    const interval = setInterval(() => {
      fetchProjects().then((p) => setProjects(p));
    }, 10000);

    return () => clearInterval(interval);
  }, [session]);

  // ── Load messages when selected project changes ───────────────────────────
  useEffect(() => {
    if (!session || !projects[selected]) return;
    fetchMessages(projects[selected].id).then((msgs) => {
      setMessages(msgs);
      setUnreadCount(msgs.filter((m) => !m.read && m.sender === "admin").length);
    });
  }, [selected, projects, session]);

  // ── Auto-refresh messages every 3 seconds ────────────────────────────────
  useEffect(() => {
    if (!session || !projects[selected]) return;
    const id = projects[selected].id;
    const interval = setInterval(() => {
      fetchMessages(id).then((msgs) => {
        setMessages(msgs);
        setUnreadCount(msgs.filter((m) => !m.read && m.sender === "admin").length);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [selected, projects, session]);

  if (!session) return null;

  const active = projects[selected] || null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    const res = await cancelProject(cancelTarget.id);
    if (res.ok) setProjects((prev) => prev.map((p) =>
      p.id === cancelTarget.id ? { ...p, status: "pending-cancellation" } : p
    ));
    setCancelling(false);
    setCancelTarget(null);
  }

  async function handleAcceptDelivery() {
    if (!active) return;
    setAccepting(true);
    const res = await acceptDelivery(active.id);
    if (res.ok) setProjects((prev) => prev.map((p) =>
      p.id === active.id ? { ...p, status: "completed" } : p
    ));
    setAccepting(false);
  }

  async function handleFeedbackSubmit(rating, comment) {
    if (!feedbackTarget) return;
    setSubmittingFeedback(true);
    const res = await submitFeedback(feedbackTarget.id, rating, comment);
    if (res.ok) setProjects((prev) => prev.map((p) =>
      p.id === feedbackTarget.id ? { ...p, feedback: { rating, comment } } : p
    ));
    setSubmittingFeedback(false);
    setFeedbackTarget(null);
  }

  return (
    <section className="portal-page page-pad-top">
      <div className="container">

        {/* ── Header ── */}
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
            <p>You haven't submitted a project intake yet.</p>
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

            {/* Project cards */}
            <div className="portal-cards-row">
              {projects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  selected={i === selected}
                  onClick={() => setSelected(i)}
                />
              ))}
            </div>

            {active && (
              <div className="portal-detail">
                <div className="portal-detail-header">
                  <div>
                    <div className="portal-detail-id">{active.id}</div>
                    <div className="portal-detail-svc">{active.service}</div>
                    {/* Payment badge in detail header */}
                    {active.payment?.status && (
                      <div style={{ marginTop: 8 }}>
                        <PaymentBadge payment={active.payment} />
                      </div>
                    )}
                  </div>
                  <StatusBadge status={active.status} large />
                </div>

                <div className="portal-detail-grid">
                  <div className="portal-detail-left">
                    {/* Timeline now reacts to status + payment */}
                    <Timeline project={active} />
                  </div>
                  <div className="portal-detail-right">
                    <StatsRow project={active} />
                    <TrustBlock />

                    {/* ── Checkout button ── */}
                    {active.status === "in-analysis" && !active.payment && (
                      <div style={{ marginTop: 20 }}>
                        <button
                          onClick={() => navigate(`/checkout/${active.id}`)}
                          style={{
                            width: "100%", padding: "10px 0", borderRadius: 8,
                            border: "1px solid #38bdf844", background: "#38bdf811",
                            color: "#38bdf8", fontSize: 12, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.05em",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#38bdf822";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#38bdf811";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          💰 Proceed to Checkout
                        </button>
                      </div>
                    )}

                    {/* ── Payment pending notice ── */}
                    {active.payment?.status === "pending" && (
                      <div style={{
                        marginTop: 20, padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #38bdf844", background: "#38bdf811",
                        color: "#38bdf8", fontSize: 13, textAlign: "center", fontWeight: 700,
                      }}>
                        ⏳ Payment submitted — awaiting confirmation
                      </div>
                    )}

                    {/* ── Payment success notice ── */}
                    {active.payment?.status === "paid" && (
                      <div style={{
                        marginTop: 20, padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #4ade8044", background: "#4ade8011",
                        color: "#4ade80", fontSize: 13, textAlign: "center", fontWeight: 700,
                      }}>
                        ✅ Payment confirmed — your project is fully active!
                      </div>
                    )}

                    {/* ── Accept Delivery button ── */}
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
                            opacity: accepting ? 0.6 : 1, transition: "all 0.2s",
                          }}
                        >
                          {accepting ? "Accepting…" : "✓ Accept Delivery"}
                        </button>
                      </div>
                    )}

                    {/* ── Feedback button ──                                          */}
                    {/* FIXED (Bug 5): previously only showed during "pending-delivery" */}
                    {/* so once a client clicked "Accept Delivery" and status became     */}
                    {/* "completed", the button vanished and they could never leave a    */}
                    {/* review. Now it also shows for "completed" status.                */}
                    {(active.status === "pending-delivery" || active.status === "completed") && !active.feedback && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          onClick={() => setFeedbackTarget(active)}
                          style={{
                            width: "100%", padding: "10px 0", borderRadius: 8,
                            border: "1px solid #ffaa0044", background: "#ffaa0011",
                            color: "#ffaa00", fontSize: 12, fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.05em",
                          }}
                        >
                          ⭐ Leave Feedback
                        </button>
                      </div>
                    )}

                    {/* ── Feedback already submitted ── */}
                    {active.feedback && (
                      <div style={{
                        marginTop: 20, padding: "14px 16px", borderRadius: 8,
                        border: "1px solid #ffaa0033", background: "#ffaa0011",
                        color: "#ffaa00", fontSize: 13, textAlign: "center",
                      }}>
                        ✓ Feedback submitted — Thank you!
                      </div>
                    )}

                    {/* ── Cancel button ── */}
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

                    {/* ── Status messages ── */}
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

      {/* ── Floating chat button (Portal-only, project-specific) ── */}
      {active && (
        <button
          onClick={() => setShowChatModal(true)}
          style={{
            position: "fixed", bottom: 24, right: 24,
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            color: "#000", border: "none", fontSize: 24,
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px #38bdf844", zIndex: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 16px #38bdf855";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px #38bdf844";
          }}
        >
          💬
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: "#ff4444", color: "#fff",
              width: 22, height: 22, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
              border: "2px solid #0a0a0a",
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Modals ── */}
      {showChatModal && active && (
        <ChatModal
          projectId={active.id}
          messages={messages}
          setMessages={setMessages}
          onClose={() => setShowChatModal(false)}
        />
      )}
      {cancelTarget && (
        <CancelModal
          project={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
          cancelling={cancelling}
        />
      )}
      {feedbackTarget && (
        <FeedbackModal
          project={feedbackTarget}
          onConfirm={handleFeedbackSubmit}
          onClose={() => setFeedbackTarget(null)}
          submitting={submittingFeedback}
        />
      )}
    </section>
  );
}
