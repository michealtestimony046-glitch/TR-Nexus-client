import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import InstallPrompt from "./InstallPrompt.jsx";

const Icon = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
    </svg>
  ),
  info: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  ),
  grid: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  send: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
};

const TABS = [
  { to: "/", label: "Home", icon: Icon.home, end: true },
  { to: "/about", label: "About", icon: Icon.info },
  { to: "/services", label: "Services", icon: Icon.grid },
  { to: "/intake", label: "Start", icon: Icon.send, primary: true },
];

function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <img src="/logo.png" alt="T/R Agency" />
      </span>
      <span className="brand-text">
        T<span className="slash">/</span>R Agency
      </span>
    </Link>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const { session, logout } = useAuth();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="shell">
      <nav className="nav">
        <div className="container nav-inner">
          <Brand />
          <div className="nav-links">
            {TABS.filter((t) => !t.primary).map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? "active" : "")}>
                {t.label}
              </NavLink>
            ))}
            {session ? (
              <div className="nav-user">
                <span className="nav-user-name">{session.name.split(" ")[0]}</span>
                <button className="nav-logout" onClick={logout}>Sign Out</button>
              </div>
            ) : (
              <NavLink to="/intake" className="nav-cta">Start Consult</NavLink>
            )}
          </div>
        </div>
      </nav>

      <main className="shell-main">{children}</main>

      <nav className="bottom-nav" aria-label="Primary">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `bn-tab${isActive ? " active" : ""}${t.primary ? " primary" : ""}`
            }
          >
            <span className="bn-ico">{t.icon}</span>
            <span className="bn-lbl">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <InstallPrompt />
    </div>
  );
}
