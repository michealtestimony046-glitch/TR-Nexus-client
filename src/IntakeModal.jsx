import React, { useState } from "react";

const DISCORD_URL = "https://discord.gg/Ex7XWNqDtd";
const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL || "";

export default function IntakeModal({ service, onClose }) {
  const [name, setName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [referral, setReferral] = useState("Official Website");
  const [code, setCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      service: service || "General Consult",
      name,
      projectUrl,
      referralSource: referral,
      promoterCode: referral === "Promoter Code" ? code : null,
      submittedAt: new Date().toISOString(),
    };

    // Format for Discord webhook (embed) — fire and forget
    if (WEBHOOK_URL) {
      const discordBody = JSON.stringify({
        username: "T/R Intake",
        embeds: [
          {
            title: `New Intake — ${payload.service}`,
            color: 0x38bdf8,
            fields: [
              { name: "Name", value: name || "—", inline: true },
              { name: "Project URL", value: projectUrl || "—", inline: true },
              { name: "Referral", value: referral, inline: true },
              ...(payload.promoterCode
                ? [
                    {
                      name: "Promoter Code",
                      value: payload.promoterCode,
                      inline: true,
                    },
                  ]
                : []),
            ],
            timestamp: payload.submittedAt,
          },
        ],
      });

      try {
        const blob = new Blob([discordBody], { type: "application/json" });
        navigator.sendBeacon(WEBHOOK_URL, blob);
      } catch {
        // ignore — fire and forget
      }
    }

    // Instant redirect — no UI delay. Break out of any iframe so Discord loads at the top.
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = DISCORD_URL;
        return;
      }
    } catch {
      // cross-origin iframe — fall through to opening in a new tab
      window.open(DISCORD_URL, "_blank", "noopener");
      return;
    }
    window.location.replace(DISCORD_URL);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
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
            <select
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            >
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
            After submission, you will be redirected to our Discord Command
            Center. You must manually{" "}
            <strong
              style={{
                display: "inline",
                textTransform: "none",
                letterSpacing: 0,
                color: "#fff",
              }}
            >
              "Create a Ticket"
            </strong>{" "}
            inside the server to be attended to by our team.
          </div>

          <button type="submit" className="btn btn-primary">
            Submit & Enter Command Center
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
