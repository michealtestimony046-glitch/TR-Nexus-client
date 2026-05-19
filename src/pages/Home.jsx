import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="container hero-inner">
          <div className="eyebrow"><span className="dot" />Operational · USA · UK · NG</div>
          <h1>
            Technical Precision.<br />
            <span className="accent">Guaranteed Performance.</span>
          </h1>
          <p className="lead">
            Premium QA Testing, Technical Audits, and Software Engineering for Global Startups.
            Elite operations across three continents — boutique scale, mission-critical standards.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/services">
              Explore Our Solutions
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <Link className="btn btn-ghost" to="/intake">Request a Consult</Link>
          </div>
          <div className="hero-meta">
            <div><strong>14-Day</strong><span>QA Sprint</span></div>
            <div><strong>3 Continents</strong><span>Tester Network</span></div>
            <div><strong>&lt; 2s</strong><span>Load Standard</span></div>
          </div>
        </div>
      </header>

      <section className="cta-strip">
        <div className="container">
          <div className="section-tag" style={{ marginBottom: 18 }}>// Engage</div>
          <h2>Ready to ship without the risk?</h2>
          <p>Tell us about your project. We'll meet you in the Command Center.</p>
          <Link className="btn btn-primary" to="/intake">
            Start a Consult
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>
    </>
  );
}
