import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getSession } from "../auth.js";
import { SERVICES } from "../services.js";

const DISCORD_URL = "https://discord.gg/Ex7XWNqDtd";
const CALENDLY_URL = "https://calendly.com/tragency-ops-proton/30min";
const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL || "";
const LEAD_BACKUP_KEY = "tr_agency_lead_backups";

function getPriceForService(serviceName) {
  for (const cat of SERVICES) {
    for (const item of cat.items) {
      if (item.name === serviceName) return item.price;
    }
  }
  return "Custom";
}

function saveLeadBackup(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem(LEAD_BACKUP_KEY) || "[]");
    existing.push(payload);
    localStorage.setItem(LEAD_BACKUP_KEY, JSON.stringify(existing.slice(-50)));
  } catch {}
}

function redirectToDiscord() {
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = DISCORD_URL;
      return;
    }
  } catch {
    window.open(DISCORD_URL, "_blank", "noopener");
    return;
  }
  window.location.replace(DISCORD_URL);
}

async function fireWebhook(payload) {
  if (!WEBHOOK_URL) return { ok: false, reason: "no_webhook_configured" };
  const body = JSON.stringify({
    username: "T/R Intake — Safety Net",
    content: "**New Lead Submission** — admin-leads",
    embeds: [
      {
        title: `New Intake — ${payload.service}`,
        color: 0x38bdf8,
        fields: [
          { name: "Project ID", value: payload.projectId || "—", inline: true },
          { name: "Name", value: payload.name || "—", inline: true },
          { name: "Email", value: payload.email || "—", inline: true },
          { name: "Project URL", value: payload.projectUrl || "—", inline: true },
          { name: "Project Type", value: payload.projectType || "—", inline: true },
          { name: "Current Stage", value: payload.stage || "—", inline: true },
          { name: "Referral Source", value: payload.referralSource, inline: true },
          ...(payload.promoterCode ? [{ name: "Promoter Code", value: payload.promoterCode, inline: true }] : []),
          { name: "Service", value: payload.service, inline: false },
          { name: "Main Issue / Goal", value: payload.mainIssue || "—", inline: false },
        ],
        footer: { text: "T/R Agency · Safety Net Webhook" },
        timestamp: payload.submittedAt,
      },
    ],
  });
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
      if (res.ok) return { ok: true };
    } catch {}
  }
  return { ok: false, reason: "webhook_failed" };
}

async function saveProject(payload, token) {
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch { return { ok: false }; }
}

function CalendlyModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="calendly-panel">
        <div className="calendly-panel-header">
          <div>
            <span className="drawer-badge">Live Consult</span>
            <h3 style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 800 }}>Book Operational Consult</h3>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="calendly-frame-wrap">
          <iframe
            src={CALENDLY_URL}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Book a Consult"
            allow="payment"
          />
        </div>
      </div>
    </div>
  );
}

function InitializedScreen({ projectId, onDiscord, onPortal }) {
  return (
    <div className="initialized-screen">
      <div className="init-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </div>
      <div className="init-tag">// Project Initialized</div>
      <h2 className="init-id">{projectId}</h2>
      <p className="init-msg">
        Your project has been initialized — check your portal to see your full project details and timeline.
      </p>
      <p className="init-msg-sub">
        Where would you like to go next?
      </p>
      <div className="init-steps">
        <div className="init-step done"><span>✓</span> Project record created</div>
        <div className="init-step done"><span>✓</span> Team notification sent</div>
        <div className="init-step done"><span>✓</span> Portal updated</div>
      </div>
      <div className="init-button-group">
        <button className="btn btn-primary" onClick={onPortal}>
          💬 Chat in Portal
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
        <button className="btn btn-outline" onClick={onDiscord}>
          🔗 Go to Command Center
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>
      <p className="init-note">
        You can access both chat and Discord anytime from your portal. Chat is available 24/7, or continue to Discord for real-time support.
      </p>
    </div>
  );
}

export default function Intake() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const presetService = params.get("service") || "";

  const [name, setName] = useState(session?.name || "");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectType, setProjectType] = useState("");
  const [stage, setStage] = useState("Idea");
  const [mainIssue, setMainIssue] = useState("");
  const [referral, setReferral] = useState("Official Website");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  if (!session) {
    return (
      <section className="intake page-pad-top">
        <div className="container">
          <div className="auth-gate">
            <div className="section-tag">// Smart Intake</div>
            <h2>Operational Access Required</h2>
            <p>
              You need a free operational account to submit a project intake.
              This keeps your details secure and routed correctly to our team.
            </p>
            <div className="auth-gate-actions">
              <button className="btn btn-primary" onClick={() => navigate(`/login?next=/intake${presetService ? `?service=${encodeURIComponent(presetService)}` : ""}`)}>
                Sign In or Create Account
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
              <Link to="/services" className="back-link">← Back to services</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (initialized) {
    return (
      <section className="intake page-pad-top">
        <div className="container">
          <InitializedScreen 
            projectId={projectId} 
            onDiscord={redirectToDiscord}
            onPortal={() => navigate("/portal", { state: { openChat: true, projectId: projectId } })}
          />
        </div>
      </section>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const s = getSession();
    const price = getPriceForService(presetService);

    const payload = {
      service: presetService || "General Consult",
      price,
      name,
      email: session.email,
      projectUrl,
      projectType,
      stage,
      mainIssue,
      referralSource: referral,
      promoterCode: referral === "Promoter Code" ? code : null,
      submittedAt: new Date().toISOString(),
    };

    saveLeadBackup(payload);

    const [webhookResult, projectResult] = await Promise.all([
      fireWebhook(payload),
      saveProject(payload, s?.token),
    ]);

    if (!webhookResult.ok) console.error("[T/R Intake] Webhook failed:", webhookResult.reason);

    const pid = projectResult?.project?.id || "TR-2026-XXXX";
    setProjectId(pid);
    setInitialized(true);
    setSubmitting(false);
  }

  return (
    <section className="intake page-pad-top">
      <div className="container">

        <div className="consult-block">
          <div className="consult-block-left">
            <span className="section-tag">// Live Operations</span>
            <h3>Start Live Consult</h3>
            <p>Need direct technical discussion, project evaluation, or operational guidance?</p>
          </div>
          <button className="btn btn-outline consult-btn" onClick={() => setCalendlyOpen(true)}>
            Book Operational Consult
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="intake-wrap">
          <div className="intake-side">
            <div className="section-tag">// Smart Intake</div>
            <h2>Tell us about your project.</h2>
            <p className="lead-sm">
              Submissions route to our Discord <strong>Command Center</strong>. A real-time
              ping also fires to our private <strong>#admin-leads</strong> channel — your
              details never get lost.
            </p>
            <ul className="step-list">
              <li>
                <span className="step-n">1</span>
                <div><strong>Submit</strong><em>Form posts to the operations channel.</em></div>
              </li>
              <li>
                <span className="step-n">2</span>
                <div><strong>Portal Updated</strong><em>Your project appears in your dashboard.</em></div>
              </li>
              <li>
                <span className="step-n">3</span>
                <div><strong>Choose Your Path</strong><em>Chat in portal or Discord Command Center.</em></div>
              </li>
            </ul>
            <Link to="/portal" className="back-link">← Back to portal</Link>
          </div>

          <form className="intake-form" onSubmit={handleSubmit}>
            <div className="form-head">
              <h3>Smart Intake</h3>
              <div className="modal-svc">
                {presetService ? `// ${presetService}` : "// General Consult"}
              </div>
            </div>

            <div className="field">
              <label>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>

            <div className="field">
              <label>Project URL / Link</label>
              <input type="text" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://your-project.com or Play Store link" />
            </div>

            <div className="field">
              <label>Project Type</label>
              <input type="text" required value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="e.g. Mobile App, Web App, E-commerce..." />
            </div>

            <div className="field">
              <label>Current Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}>
                <option>Idea</option>
                <option>MVP</option>
                <option>Closed Testing</option>
                <option>Live Product</option>
                <option>Scaling</option>
              </select>
            </div>

            <div className="field">
              <label>Main Issue / Goal</label>
              <textarea required rows={4} value={mainIssue} onChange={(e) => setMainIssue(e.target.value)} placeholder="Describe your main challenge or what you want to achieve..." />
            </div>

            <div className="field">
              <label>Referral Source</label>
              <select value={referral} onChange={(e) => setReferral(e.target.value)}>
                <option>Official Website</option>
                <option>Promoter Code</option>
              </select>
            </div>

            {referral === "Promoter Code" && (
              <div className="field">
                <label>Promoter Code</label>
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. MK101" />
              </div>
            )}

            <div className="notice">
              <strong>What Happens Next?</strong>
              After submission, choose to chat in your portal or join our Discord Command Center. Both keep you connected to our ops team.
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Initializing…" : "Submit & Initialize Project"}
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {calendlyOpen && <CalendlyModal onClose={() => setCalendlyOpen(false)} />}
    </section>
  );
}
