import React from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES } from "../services.js";

export default function Services() {
  const navigate = useNavigate();
  const order = (svc) => navigate(`/intake?service=${encodeURIComponent(svc)}`);

  return (
    <section className="services page-pad-top">
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
                <div className={`svc${s.elite ? " elite" : ""}`} key={s.name}>
                  <div className="svc-top">
                    <h4>{s.name}</h4>
                    {s.badge && <span className="badge">{s.badge}</span>}
                  </div>
                  <p className="desc">{s.desc}</p>
                  <div className="price-row">
                    <span className="price">${s.price.toFixed(2)}</span>
                    <span className="price-unit">{s.unit}</span>
                  </div>
                  <button className="svc-cta" onClick={() => order(s.name)}>
                    <span>{s.elite ? "Order Suite" : "Order"}</span>
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
