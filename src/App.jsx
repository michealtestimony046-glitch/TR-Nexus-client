import React, { useState, useEffect } from 'react';
import IntakeModal from './IntakeModal.jsx';
import { SERVICES } from './services.js';

const Logo = () => (
  <span className="brand">
    <span className="brand-mark">T/R</span>
    <span className="brand-text">T<span className="slash">/</span>R Agency</span>
  </span>
);

function Nav({ onConsult }) {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Logo />
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#mission">Mission</a>
          <a href="#services">Services</a>
          <button className="nav-cta" onClick={onConsult}>Start Consult</button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onConsult }) {
  return (
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
          <a className="btn btn-primary" href="#services">
            Explore Our Solutions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
          <button className="btn btn-ghost" onClick={onConsult}>Request a Consult</button>
        </div>
        <div className="hero-meta">
          <div><strong>14-Day</strong><span>QA Sprint</span></div>
          <div><strong>3 Continents</strong><span>Tester Network</span></div>
          <div><strong>&lt; 2s</strong><span>Load Standard</span></div>
        </div>
      </div>
    </header>
  );
}

function About() {
  return (
    <section id="about" className="about">
      <div className="container about-grid">
        <div className="about-body">
          <div className="section-tag">// 01 — About</div>
          <h2 style={{ fontSize: 'clamp(30px,4vw,44px)', margin: '0 0 24px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
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
  );
}

const MissionIcons = {
  shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/></svg>,
  target: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  globe: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>,
};

function Mission() {
  return (
    <section id="mission" className="mission">
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
  );
}

function Services({ onConsult }) {
  return (
    <section id="services" className="services">
      <div className="container">
        <div className="section-head">
          <div className="section-tag">// 03 — Catalog</div>
          <h2>Service Catalog</h2>
          <p>Modular technical operations — engage a single tester or commission a full PWA suite. Every order routes directly to our Discord Command Center.</p>
        </div>

        {SERVICES.map((cat) => (
          <div className="svc-cat" key={cat.id}>
            <div className="svc-cat-head">
              <h3>{cat.title}</h3>
              <span className="id">{cat.id}</span>
            </div>
            <div className="svc-grid">
              {cat.items.map((s) => (
                <div className={`svc${s.elite ? ' elite' : ''}`} key={s.name}>
                  <div className="svc-top">
                    <h4>{s.name}</h4>
                    {s.badge && <span className="badge">{s.badge}</span>}
                  </div>
                  <p className="desc">{s.desc}</p>
                  <div className="price-row">
                    <span className="price">${s.price.toFixed(2)}</span>
                    <span className="price-unit">{s.unit}</span>
                  </div>
                  <button className="svc-cta" onClick={() => onConsult(s.name)}>
                    <span>{s.elite ? 'Order Suite' : 'Order'}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaStrip({ onConsult }) {
  return (
    <section className="cta-strip">
      <div className="container">
        <div className="section-tag" style={{ marginBottom: 18 }}>// 04 — Engage</div>
        <h2>Ready to ship without the risk?</h2>
        <p>Tell us about your project. We'll meet you in the Command Center.</p>
        <button className="btn btn-primary" onClick={() => onConsult()}>
          Start a Consult
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="container foot-inner">
        <div>© {new Date().getFullYear()} T/R Agency — Technical Operations & QA Excellence</div>
        <div className="locs">
          <span><span className="pin" />USA</span>
          <span><span className="pin" />UK</span>
          <span><span className="pin" />Nigeria</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [modal, setModal] = useState({ open: false, service: null });
  const open = (service = null) => setModal({ open: true, service });
  const close = () => setModal({ open: false, service: null });

  useEffect(() => {
    document.body.style.overflow = modal.open ? 'hidden' : '';
  }, [modal.open]);

  return (
    <>
      <Nav onConsult={() => open()} />
      <Hero onConsult={() => open()} />
      <About />
      <Mission />
      <Services onConsult={open} />
      <CtaStrip onConsult={open} />
      <Footer />
      {modal.open && <IntakeModal service={modal.service} onClose={close} />}
    </>
  );
}
