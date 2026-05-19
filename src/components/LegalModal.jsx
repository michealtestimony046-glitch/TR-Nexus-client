import React, { useEffect } from "react";

const TOS_CONTENT = [
  {
    title: "1. Service Scope",
    body: "T/R Agency provides technical operations services including QA testing, app stability testing, Google Play closed testing participation, technical audits, MVP development, performance optimization, software engineering support, and operational consultations. Service availability may vary depending on operational capacity and project requirements.",
  },
  {
    title: "2. No Guarantee of Platform Approval or Ranking",
    body: "While we provide testing, optimization, and operational support, T/R Agency does not guarantee Google Play approval, App Store approval, ranking placement, downloads, revenue growth, platform visibility, or user retention outcomes. Final platform decisions remain under the control of Google, Apple, Amazon, or other third-party platforms.",
  },
  {
    title: "3. Testing Limitations",
    body: "Testing services are designed to identify issues, validate flows, and improve operational stability. However, not all bugs can be detected, device behavior may vary, third-party systems may behave unpredictably, and future updates may introduce new issues. Clients remain responsible for final deployment decisions.",
  },
  {
    title: "4. Payment Terms",
    body: "Payments must be completed before operational work begins unless otherwise agreed. Certain services may require milestone-based payments or subscription renewals. Failure to complete payment may pause or terminate active operations.",
  },
  {
    title: "5. Refund Policy",
    body: "Due to the technical and operational nature of our services, refunds are generally not available after work has started. Partial refunds may be reviewed only under exceptional circumstances. Digital and testing services already delivered are non-refundable.",
  },
  {
    title: "6. Client Responsibility",
    body: "Clients are responsible for providing accurate project information, maintaining lawful content and software, ensuring they have rights to submitted materials, and securing their own developer and platform accounts. T/R Agency is not responsible for misuse of third-party platforms or violations caused by client-provided materials.",
  },
  {
    title: "7. Communication Channels",
    body: "Operational communication may occur through Discord, email, intake systems, and consultation platforms. Clients acknowledge that response times may vary depending on workload and operational schedules.",
  },
  {
    title: "8. Limitation of Liability",
    body: "T/R Agency shall not be held liable for platform rejection, lost revenue, indirect damages, data loss caused by third-party systems, deployment decisions made by clients, or service interruptions outside our control. All services are provided on a best-effort operational basis.",
  },
  {
    title: "9. Operational Access",
    body: "Users accessing the platform may be required to create an operational access account, verify email ownership, and accept these terms before proceeding. Access may be restricted or revoked for abuse, fraud, harassment, or misuse of operational systems.",
  },
  {
    title: "10. Modifications",
    body: "T/R Agency may update operational systems, pricing, workflows, or policies at any time to improve service quality and platform stability. Continued use of the platform indicates acceptance of updated terms.",
  },
];

const PRIVACY_CONTENT = [
  {
    title: "1. Information We Collect",
    bullets: ["name", "email address", "project links", "intake submissions", "communication records", "consultation requests", "operational workflow activity"],
    body: "This information is used strictly for operational and support purposes.",
  },
  {
    title: "2. How Information Is Used",
    bullets: ["process project requests", "coordinate technical operations", "communicate with clients", "improve workflows", "provide support services", "manage consultations and testing activities"],
  },
  {
    title: "3. Discord & Third-Party Services",
    body: "Our workflows may involve third-party platforms including Discord, Calendly, email systems, hosting providers, and payment processors. By using our services, you acknowledge that operational communication may occur through these platforms.",
  },
  {
    title: "4. Data Protection",
    body: "We take reasonable measures to protect submitted information and operational records. However, no online system can guarantee absolute security.",
  },
  {
    title: "5. No Sale of User Data",
    body: "T/R Agency does not sell, rent, or trade user information to third parties. Operational access is limited to authorized internal team members only.",
  },
  {
    title: "6. Cookies & Basic Analytics",
    body: "The platform may use basic cookies or analytics tools to improve system performance, usability, and operational experience.",
  },
  {
    title: "7. Client Content",
    body: "Project files, links, screenshots, and submitted materials remain the responsibility of the client. Clients should avoid submitting highly sensitive credentials or confidential information unless necessary.",
  },
  {
    title: "8. Account Access",
    body: "Users are responsible for maintaining the security of their login credentials and operational access accounts.",
  },
  {
    title: "9. Policy Updates",
    body: "This policy may be updated periodically to reflect operational, legal, or technical changes. Continued use of the platform indicates acceptance of the latest version.",
  },
];

export default function LegalModal({ tab = "tos", onClose, onSwitchTab }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isTos = tab === "tos";
  const sections = isTos ? TOS_CONTENT : PRIVACY_CONTENT;
  const docTitle = isTos ? "Terms of Service" : "Privacy Policy";

  return (
    <div className="legal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="legal-panel">
        <div className="legal-header">
          <div className="legal-tabs">
            <button className={`legal-tab${isTos ? " active" : ""}`} onClick={() => onSwitchTab("tos")}>Terms of Service</button>
            <button className={`legal-tab${!isTos ? " active" : ""}`} onClick={() => onSwitchTab("privacy")}>Privacy Policy</button>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="legal-body">
          <div className="legal-doc-head">
            <span className="section-tag">// Legal</span>
            <h3>{docTitle}</h3>
            <p className="legal-updated">Last Updated: 2026</p>
          </div>

          {sections.map((sec, i) => (
            <div className="legal-section" key={i}>
              <h4 className="legal-section-title">{sec.title}</h4>
              {sec.body && <p className="legal-section-body">{sec.body}</p>}
              {sec.bullets && (
                <ul className="drawer-bullets">
                  {sec.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="legal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close & Return</button>
        </div>
      </div>
    </div>
  );
}
