import React, { useState } from "react";

const DISCORD_URL = "https://discord.gg/Ex7XWNqDtd";
const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL || "";
const LEAD_BACKUP_KEY = "tr_agency_lead_backups";

function saveLeadBackup(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem(LEAD_BACKUP_KEY) || "[]");
    existing.push(payload);
    localStorage.setItem(LEAD_BACKUP_KEY, JSON.stringify(existing.slice(-50)));
  } catch {
    // localStorage unavailable — non-fatal
  }
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

  const discordBody = JSON.stringify({
    username: "T/R Intake — Safety Net",
    content: "**New Lead Submission** — admin-leads",
    embeds: [
      {
        title: `New Intake — ${payload.service}`,
        color: 0x38bdf8,
        fields: [
          { name: "Name", value: payload.name || "—", inline: true },
          { name: "App URL", value: payload.projectUrl || "—", inline: true },
          { name: "Referral Source", value: payload.referralSource, inline: true },
          ...(payload.promoterCode
            ? [{ name: "Promoter Code", value: payload.promoterCode, inline: true }]
            : []),
          { name: "Service", value: payload.service, inline: false },
        ],
        footer: { text: "T/R Agency · Safety Net Webhook" },
        timestamp: payload.submittedAt,
      },
    ],
  });

  // Try once, retry once on failure. `keepalive` lets the request survive page navigation.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: discordBody,
        keepalive: true,
      });
      if (res.ok) return { ok: true };
    } catch {
      // retry
    }
  }
  return { ok: false, reason: "webhook_failed" };
}

export default function IntakeModal({ service, onClose }) {
  const [name, setName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [referral, setReferral] = useState("Official Website");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      service: service || "General Consult",
      name,
      projectUrl,
      referralSource: referral,
      promoterCode: referral === "Promoter Code" ? code : null,
      submittedAt: new Date().toISOString(),
    };

    // Step 1 — Local backup (final safety net if everything else fails)
    saveLeadBackup(payload);

    // Step 2 — Webhook to #admin-leads (await confirmation before redirect)
    const result = await fireWebhook(payload);
    if (!result.ok) {
      console.error("[T/R Intake] Webhook delivery failed:", result.reason, payload);
    }

    // Step 3 — Navigate to Discord Command Center
    redirectToDiscord();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <h3>Smart Intake</h3>
        <div className="modal-svc">
          {service ? `// ${service}` : "// General Consult"}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="field">
            <label>Project URL / Link</label>
            <input
              type="url"
              required
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://your-project.com"
            />
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
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MK101"
              />
            </div>
          )}

          <div className="notice">
            <strong>Action Required</strong>
            After submission, you will be redirected to our Discord Command Center. You must manually{" "}
            <strong style={{ display: "inline", textTransform: "none", letterSpacing: 0, color: "#fff" }}>
              "Create a Ticket"
            </strong>{" "}
            inside the server to be attended to by our team.
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit & Enter Command Center"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
