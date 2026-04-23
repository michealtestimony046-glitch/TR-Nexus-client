import React from "react";

const MissionIcons = {
  shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/></svg>,
  target: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  globe: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>,
};

export default function About() {
  return (
    <>
      <section className="about page-pad-top">
        <div className="about-watermark" aria-hidden="true" />
        <div className="container about-grid">
          <div className="about-body">
            <div className="section-tag">// 01 — About</div>
            <h2 style={{ fontSize: "clamp(30px,4vw,44px)", margin: "0 0 24px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Global Intelligence.<br />Elite Engineering.
            </h2>
            <p>
              <strong>T/R Agency</strong> is a high-performance technical hub founded and led by
              CEO <strong>Micheal D Testimony</strong>. Supported by our specialized CTO
              (Technical Architect) and COO (Operations Lead), we bridge the gap between complex
              code and market success.
            </p>
            <p>
              With a veteran testing network spanning the <strong>USA, UK, and Nigeria</strong>,
              we provide <strong>"Success Insurance"</strong> for global startups — ensuring
              every release ships bug-free, ranks high on App Stores, and converts users into
              customers.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-card"><div className="num">3</div><div className="lbl">Continents of validated testing coverage</div></div>
            <div className="stat-card"><div className="num">14d</div><div className="lbl">Standard QA sprint cycle</div></div>
            <div className="stat-card"><div className="num">10+</div><div className="lbl">Specialized service modules</div></div>
          </div>
        </div>
      </section>

      <section className="mission">
        <div className="container">
          <div className="section-head">
            <div className="section-tag">// 02 — Standard</div>
            <h2>The T/R Standard: Mission-Critical Support</h2>
            <p>
              T/R Agency is a boutique technical powerhouse specializing in high-performance
              app testing and custom software architecture. We don't just build code — we deliver
              "Success Insurance" so your digital assets are bug-free, rank high, and convert.
            </p>
          </div>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="ico">{MissionIcons.shield}</div>
              <h3>Success Insurance</h3>
              <p>Every deliverable is validated against real-world conditions before it touches your users. Risk eliminated, performance guaranteed.</p>
            </div>
            <div className="mission-card">
              <div className="ico">{MissionIcons.target}</div>
              <h3>Boutique Precision</h3>
              <p>Founded by CEO Micheal D Testimony, supported by a specialized CTO and COO — focused engagements, never assembly-line outputs.</p>
            </div>
            <div className="mission-card">
              <div className="ico">{MissionIcons.globe}</div>
              <h3>Global Validation</h3>
              <p>A veteran testing network across the USA, UK, and Nigeria provides authentic, cross-market performance feedback.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
