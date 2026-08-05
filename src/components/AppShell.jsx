import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getSession, apiBase } from "../auth.js";
import InstallPrompt from "./InstallPrompt.jsx";
import ChatModal from "./ChatModal.jsx";

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
  portal: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M 12 11 C 9.5 11 7 12.5 7 14.5 L 7 21 L 17 21 L 17 14.5 C 17 12.5 14.5 11 12 11" />
      <circle cx="19" cy="5" r="3" fill="currentColor" />
      <path d="M 17.5 5 L 18.5 6 L 20.5 4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const TABS = [
  { to: "/", label: "Home", icon: Icon.home, end: true },
  { to: "/about", label: "About", icon: Icon.info },
  { to: "/services", label: "Services", icon: Icon.grid },
  { to: "/intake", label: "Start", icon: Icon.send, primary: true },
];

const TABS_LOGGED_IN = [
  { to: "/", label: "Home", icon: Icon.home, end: true },
  { to: "/about", label: "About", icon: Icon.info },
  { to: "/services", label: "Services", icon: Icon.grid },
  { to: "/portal", label: "Portal", icon: Icon.portal, primary: true },
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

// Returns { unreadCount, firstUnreadProjectId, firstUnreadMessages }
async function fetchUnreadInfo() {
  const s = getSession();
  if (!s) return { unreadCount: 0, firstUnreadProjectId: null, firstUnreadMessages: [] };

  try {
    const res = await fetch(`${apiBase}/api/projects`, {
      headers: { Authorization: `Bearer ${s.token}` },
    });
    const data = await res.json();
    if (!data.ok || !data.projects?.length) {
      return { unreadCount: 0, firstUnreadProjectId: null, firstUnreadMessages: [] };
    }

    let totalUnread = 0;
    let firstUnreadProjectId = null;
    let firstUnreadMessages = [];

    for (const project of data.projects) {
      const msgRes = await fetch(`${apiBase}/api/projects/${project.id}/messages`, {
        headers: { Authorization: `Bearer ${s.token}` },
      });
      const msgData = await msgRes.json();
      if (msgData.ok) {
        const unread = msgData.messages.filter((m) => !m.read && m.sender === "admin");
        totalUnread += unread.length;

        // Track the first project that has unread messages
        if (unread.length > 0 && !firstUnreadProjectId) {
          firstUnreadProjectId = project.id;
          firstUnreadMessages  = msgData.messages;
        }
      }
    }

    return { unreadCount: totalUnread, firstUnreadProjectId, firstUnreadMessages };
  } catch (err) {
    console.error("[AppShell] fetchUnreadInfo error:", err);
    return { unreadCount: 0, firstUnreadProjectId: null, firstUnreadMessages: [] };
  }
}

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { session, logout } = useAuth();

  const [totalUnread,    setTotalUnread   ] = useState(0);
  const [showChatModal,  setShowChatModal ] = useState(false);
  const [chatMessages,   setChatMessages  ] = useState([]);
  const [chatProjectId,  setChatProjectId ] = useState(null);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Load unread count on mount / session change
  useEffect(() => {
    if (!session) { setTotalUnread(0); return; }
    fetchUnreadInfo().then(({ unreadCount }) => setTotalUnread(unreadCount));
  }, [session]);

  // Auto-refresh unread count every 8 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      fetchUnreadInfo().then(({ unreadCount }) => setTotalUnread(unreadCount));
    }, 8000);
    return () => clearInterval(interval);
  }, [session]);

  // ── Open chat: find the right project ─────────────────────────────────────
  async function handleChatOpen() {
    if (!session) return;

    const { unreadCount, firstUnreadProjectId, firstUnreadMessages } = await fetchUnreadInfo();

    if (firstUnreadProjectId) {
      // Open the project that has unread messages
      setChatProjectId(firstUnreadProjectId);
      setChatMessages(firstUnreadMessages);
      setTotalUnread(unreadCount);
      setShowChatModal(true);
    } else {
      // No unread messages — fetch first available project and open that
      try {
        const s = getSession();
        const res = await fetch(`${apiBase}/api/projects`, {
          headers: { Authorization: `Bearer ${s.token}` },
        });
        const data = await res.json();

        if (data.ok && data.projects?.length > 0) {
          const firstProject = data.projects[0];

          // Load messages for that project
          const msgRes = await fetch(`${apiBase}/api/projects/${firstProject.id}/messages`, {
            headers: { Authorization: `Bearer ${s.token}` },
          });
          const msgData = await msgRes.json();

          setChatProjectId(firstProject.id);
          setChatMessages(msgData.ok ? msgData.messages : []);
          setShowChatModal(true);
        } else {
          // User has no projects at all — send them to portal
          navigate("/portal");
        }
      } catch (err) {
        console.error("[AppShell] handleChatOpen error:", err);
        navigate("/portal");
      }
    }
  }

  const isPortal = location.pathname === "/portal";
  const isHome = location.pathname === "/";
  const bottomTabs = session ? TABS_LOGGED_IN : TABS;

  return (
    <div className="shell">
      {!isHome && (
        <nav className="nav">
          <div className="container nav-inner">
            <Brand />
            <div className="nav-links">
              {TABS.filter((t) => !t.primary).map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {t.label}
                </NavLink>
              ))}
              {session ? (
                <div className="nav-user">
                  <NavLink to="/portal" className="nav-portal">
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="7" r="3.5" />
                      <path d="M 12 11 C 9.5 11 7 12.5 7 14.5 L 7 21 L 17 21 L 17 14.5 C 17 12.5 14.5 11 12 11" />
                      <circle cx="19" cy="5" r="3" fill="currentColor" />
                      <path d="M 17.5 5 L 18.5 6 L 20.5 4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Portal
                  </NavLink>
<span className="nav-user-name">{session.name?.split(" ")[0] || "Account"}</span>
                  <button className="nav-logout" onClick={logout}>Sign Out</button>
                </div>
              ) : (
                <NavLink to="/intake" className="nav-cta">Start Consult</NavLink>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="shell-main" style={isHome ? { paddingBottom: 0 } : {}}>{children}</main>

      <nav className="bottom-nav" aria-label="Primary" style={isHome ? { display: "none" } : {}}>
        {bottomTabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `bn-tab${isActive ? " active" : ""}${t.primary ? " primary" : ""}`
            }
          >
            <span className="bn-ico" aria-hidden="true">{t.icon}</span>
            <span className="bn-lbl">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── AI Assistant pill — visible to everyone ── */}
      <a
        href="https://t.me/EvelynVerabot"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: session && !isPortal ? 140 : 84, right: 16,
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 18px",
          background: "rgba(6,12,26,0.55)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: 999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
          zIndex: 300,
          textDecoration: "none",
          transition: "all 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(56,189,248,0.12)";
          e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(56,189,248,0.1)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(6,12,26,0.55)";
          e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)";
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.06), inset 0 1px 0 rgba(255,255,255,0.06)";
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(56,189,248,0.12)",
          border: "1px solid rgba(56,189,248,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h4V5.72A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
            <circle cx="9" cy="14" r="1.5" fill="#38bdf8" stroke="none"/>
            <circle cx="15" cy="14" r="1.5" fill="#38bdf8" stroke="none"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.01em", lineHeight: 1.2 }}>
            Ask AI Assistant
          </div>
          <div style={{ fontSize: 10, color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em" }}>
            24/7 available
          </div>
        </div>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#4ade80",
          boxShadow: "0 0 6px #4ade80",
          flexShrink: 0,
          animation: "live-blink 2s ease-in-out infinite",
        }} />
      </a>

      {/* ── Chat bubble (glass) — hidden on /portal ── */}
      {session && !isPortal && (
        <button
          onClick={handleChatOpen}
          style={{
            position: "fixed", bottom: 84, right: 16,
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(6,12,26,0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(56,189,248,0.22)",
            color: "#38bdf8", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
            zIndex: 300,
            transition: "all 0.2s",
          }}
          title={
            totalUnread > 0
              ? `${totalUnread} unread message${totalUnread !== 1 ? "s" : ""}`
              : "Project Discussion"
          }
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56,189,248,0.12)";
            e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)";
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(6,12,26,0.55)";
            e.currentTarget.style.borderColor = "rgba(56,189,248,0.22)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {totalUnread > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              background: "#ff4444", color: "#fff",
              width: 18, height: 18, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700,
              border: "2px solid rgba(4,8,18,0.8)",
            }}>
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Modal — opens on the correct project ── */}
      {showChatModal && session && chatProjectId && (
        <ChatModal
          projectId={chatProjectId}
          messages={chatMessages}
          setMessages={setChatMessages}
          onClose={() => {
            setShowChatModal(false);
            // Refresh unread count after closing
            fetchUnreadInfo().then(({ unreadCount }) => setTotalUnread(unreadCount));
          }}
        />
      )}

      <InstallPrompt />
    </div>
  );
}
