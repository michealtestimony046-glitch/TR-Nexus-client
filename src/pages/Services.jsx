import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES } from "../services.js";

function ServiceDrawer({ service, onClose, onProceed }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-panel">
        <div className="drawer-header">
          <div>
            <span className="drawer-badge">{service.badge}</span>
            <h3 className="drawer-title">{service.name}</h3>
            <p className="drawer-hook">{service.hook}</p>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {service.sections.map((sec, i) => (
            <div className="drawer-section" key={i}>
              {sec.heading && <h4 className="drawer-section-title">{sec.heading}</h4>}
              {sec.body && <p className="drawer-section-body">{sec.body}</p>}
              {sec.bullets && (
                <ul className="drawer-bullets">
                  {sec.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {sec.footer && <p className="drawer-section-footer">{sec.footer}</p>}
            </div>
          ))}
        </div>

        <div className="drawer-footer">
          <div className="drawer-price-row">
            <span className="drawer-price-label">Starting from</span>
            <span className={`drawer-price-value${service.elite ? " elite" : ""}`}>{service.price}</span>
          </div>
          <button className="btn btn-primary drawer-proceed" onClick={onProceed}>
            Proceed
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const activeService = SERVICES.flatMap((c) => c.items).find((s) => s.id === active) || null;

  function handleProceed() {
    if (activeService) {
      navigate(`/intake?service=${encodeURIComponent(activeService.name)}`);
    }
  }

  return (
    <section className="services page-pad-top">
      <div className="container">
        <div className="section-head">
          <div className="section-tag">// 03 — Catalog</div>
          <h2>Service Catalog</h2>
          <p>
            Modular technical operations — select a service to initialize the
            workflow. Every submission routes directly to our Discord Command
            Center.
          </p>
        </div>

        {SERVICES.map((cat) => (
          <div className="svc-cat" key={cat.id}>
            <div className="svc-cat-head">
              <h3>{cat.title}</h3>
              <span className="id">{cat.id}</span>
            </div>
            <div className="svc-grid">
              {cat.items.map((s) => (
                <div className={`svc${s.elite ? " elite" : ""}`} key={s.id}>
                  <div className="svc-top">
                    <h4>{s.name}</h4>
                    {s.badge && <span className="badge">{s.badge}</span>}
                  </div>
                  <p className="desc">{s.hook}</p>
                  <div className="price-row">
                    <span className="price">{s.price}</span>
                  </div>
                  <button
                    className="svc-cta"
                    onClick={() => setActive(s.id)}
                  >
                    <span>Initialize</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeService && (
        <ServiceDrawer
          service={activeService}
          onClose={() => setActive(null)}
          onProceed={handleProceed}
        />
      )}
    </section>
  );
}
