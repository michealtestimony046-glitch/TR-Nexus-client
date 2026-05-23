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

function timelineSteps(submittedAt) {
  const t = new Date(submittedAt).getTime();
  const now = Date.now();
  const elapsed = now - t;
  const steps = [
    { label: "Project initialized",           detail: "System accepted your intake submission.", doneAfter: 0 },
    { label: "Request received by T/R Agency", detail: "Our operations team has been notified.",   doneAfter: 5000 },
    { label: "Team notification sent",         detail: "Alert fired to #admin-leads channel.",      doneAfter: 30000 },
    { label: "Awaiting Discord session",       detail: "Open a ticket in the Command Center.",      doneAfter: 120000 },
    { label: "Analysis begins",                detail: "Team reviews your project in detail.",      doneAfter: Infinity },
    { label: "Report delivered",               detail: "Final deliverable sent to your account.",   doneAfter: Infinity },
  ];
  return steps.map((s) => ({ ...s, done: elapsed >= s.doneAfter }));
}

function fmt(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ProjectCard({ project, selected, onClick }) {
  return (
    <button className={`portal-card${selected ? " selected" : ""}`} onClick={onClick}>
      <div className="portal-card-top">
        <span className="portal-project-id">{project.id}</span>
        <span className="portal-active-badge"><span className="pulse-dot" />ACTIVE</span>
      </div>
      <div className="portal-card-svc">{project.service}</div>
      <div className="portal-card-meta">{fmt(project.submittedAt)}</div>
    </button>
  );
}

function Timeline({ project }) {
  const steps = timelineSteps(project.submittedAt);
  return (
    <div className="portal-timeline">
      <div className="portal-section-label">// Activity Timeline</div>
      {steps.map((step, i) => (
        <div key={i} className={`tl-step${step.done ? " done" : " pending"}`}>
          <div className="tl-line-wrap">
            <div className="tl-dot">{step.done ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg> : null}</div>
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

export default function Portal() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { navigate("/login", { replace: true }); return; }
    fetchProjects().then((p) => { setProjects(p); setLoading(false); });
  }, [session]);

  if (!session) return null;

  const active = projects[selected] || null;

  return (
    <section className="portal-page page-pad-top">
      <div className="container">

        {/* Header */}
        <div className="portal-header">
          <div>
            <div className="section-tag">// Client Portal</div>
            <h2 className="portal-greeting">Welcome back, <span className="accent">{session.name.split(" ")[0]}</span></h2>
          </div>
          <div className="portal-header-right">
            <span className="portal-status-pill"><span className="pulse-dot" />OPERATIONAL</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/login"); }}>Sign Out</button>
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
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6M9 16h6M7 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M9 4a2 2 0 0 0 4 0M9 4a2 2 0 0 1 4 0"/></svg>
            </div>
            <h3>No Active Projects</h3>
            <p>You haven't submitted a project intake yet. Initialize your first project to get started.</p>
            <Link className="btn btn-primary" to="/intake">
              Initialize First Project
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
        ) : (
          <div className="portal-body">

            {/* Project cards row */}
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
                {/* Detail header */}
                <div className="portal-detail-header">
                  <div>
                    <div className="portal-detail-id">{active.id}</div>
                    <div className="portal-detail-svc">{active.service}</div>
                  </div>
                  <span className="portal-active-badge lg"><span className="pulse-dot" />ACTIVE — Team Notified</span>
                </div>

                <div className="portal-detail-grid">
                  <div className="portal-detail-left">
                    <Timeline project={active} />
                  </div>
                  <div className="portal-detail-right">
                    <StatsRow project={active} />
                    <TrustBlock />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initialize another project */}
        {!loading && (
          <div className="portal-init-another">
            <div className="portal-section-label">// New Operation</div>
            <h3>Initialize Another Project</h3>
            <p>Ready to start a new engagement? Browse our services and submit a new intake.</p>
            <Link className="btn btn-outline" to="/services">
              Browse Services
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
