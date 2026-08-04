import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiBase } from "../auth.js";

const ADMIN_KEY = "tr_admin_session";

function getAdminKey() { return localStorage.getItem(ADMIN_KEY) || ""; }
function saveAdminKey(pw) { localStorage.setItem(ADMIN_KEY, pw); }
function clearAdminKey() { localStorage.removeItem(ADMIN_KEY); }

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday
    ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatusBadge({ status }) {
  const map = {
    active:                 { label: "ACTIVE",           color: "#38bdf8" },
    "in-analysis":          { label: "IN ANALYSIS",      color: "#a78bfa" },
    "pending-delivery":     { label: "PENDING DELIVERY", color: "#ffaa00" },
    completed:              { label: "COMPLETED",        color: "#4ade80" },
    "pending-cancellation": { label: "PENDING CANCEL",   color: "#ff6b6b" },
    cancelled:              { label: "CANCELLED",        color: "#6b7280" },
  };
  const s = map[status] || { label: status?.toUpperCase(), color: "#6b7280" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
      color: s.color, border: `1px solid ${s.color}33`,
      background: `${s.color}11`, borderRadius: 4, padding: "2px 7px",
    }}>
      {status === "active" && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      )}
      {s.label}
    </span>
  );
}

function PaymentBadge({ status }) {
  if (!status) return null;
  const map = {
    pending:  { label: "⏳ PENDING PAYMENT", color: "#38bdf8" },
    paid:     { label: "✅ PAID",            color: "#4ade80" },
    rejected: { label: "❌ REJECTED",        color: "#ff6b6b" },
  };
  const s = map[status];
  if (!s) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      color: s.color, border: `1px solid ${s.color}33`,
      background: `${s.color}11`, borderRadius: 4, padding: "2px 7px",
    }}>
      {s.label}
    </span>
  );
}

// ── Admin Login ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${apiBase}/api/projects/all`, { headers: { "x-admin-key": pw } });
      const data = await res.json();
      if (data.ok) { saveAdminKey(pw); onLogin(pw); }
      else setError("Invalid admin password.");
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  }

  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#050505", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 360,
        background: "#0f0f0f", border: "1px solid #1a1a1a",
        borderRadius: 16, padding: "32px 28px",
        boxShadow: "0 0 0 1px #38bdf80a, 0 32px 64px #00000099",
      }}>
        <div style={{
          width: 48, height: 48,
          background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
          borderRadius: 12, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22, marginBottom: 24,
          fontWeight: 900, color: "#000",
        }}>T</div>
        <div style={{ fontSize: 10, color: "#38bdf8", letterSpacing: "0.14em", marginBottom: 6, fontWeight: 700 }}>
          // ADMIN ACCESS
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#fff" }}>
          T/R Agency
        </h2>
        <p style={{ margin: "0 0 28px", color: "#3a3a3a", fontSize: 13 }}>
          Operations Control Panel
        </p>
        <form onSubmit={handleLogin}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              type={show ? "text" : "password"}
              required value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Admin password"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#0a0a0a", border: "1px solid #1e1e1e",
                borderRadius: 10, padding: "12px 44px 12px 14px",
                color: "#fff", fontSize: 14, outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#38bdf8"}
              onBlur={e => e.currentTarget.style.borderColor = "#1e1e1e"}
            />
            <button type="button" onClick={() => setShow(v => !v)} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14,
            }}>
              {show ? "🙈" : "👁️"}
            </button>
          </div>
          {error && (
            <div style={{
              background: "#ff444411", border: "1px solid #ff444433",
              borderRadius: 8, padding: "9px 14px", color: "#ff6b6b",
              fontSize: 12, marginBottom: 12,
            }}>{error}</div>
          )}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px 0", borderRadius: 10,
            background: "linear-gradient(135deg,#38bdf8,#0ea5e9)", color: "#000",
            fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer",
            opacity: loading ? 0.7 : 1, transition: "all 0.15s",
          }}>
            {loading ? "Verifying…" : "Access Panel →"}
          </button>
        </form>
      </div>
    </section>
  );
}

// ── Messages Panel ─────────────────────────────────────────────────────────────
function MessagesPanel({ projects, adminPw }) {
  const [selected,    setSelected   ] = useState(null);
  const [messages,    setMessages   ] = useState([]);
  const [text,        setText       ] = useState("");
  const [sending,     setSending    ] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const bottomRef    = useRef(null);
  const knownIds     = useRef(new Set());
  const fileRef      = useRef(null);

  const projectList = [...projects].sort((a, b) => {
    const aMsg = a.messages?.length || 0;
    const bMsg = b.messages?.length || 0;
    return bMsg - aMsg;
  });

  // ── Initial load (shows spinner once) ────────────────────────────────────
  async function loadInitial(projectId) {
    setInitialLoad(true);
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}/messages`, {
        headers: { "x-admin-key": adminPw },
      });
      const data = await res.json();
      if (data.ok) {
        const msgs = data.messages || [];
        setMessages(msgs);
        knownIds.current = new Set(msgs.map(m => m.id));
      }
    } catch (e) { console.error(e); }
    setInitialLoad(false);
  }

  // ── Silent poll — only appends NEW messages, no flicker ──────────────────
  const pollMessages = useCallback(async (projectId) => {
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}/messages`, {
        headers: { "x-admin-key": adminPw },
      });
      const data = await res.json();
      if (!data.ok) return;
      const incoming = data.messages || [];
      const newMsgs = incoming.filter(m => !knownIds.current.has(m.id));
      if (newMsgs.length > 0) {
        newMsgs.forEach(m => knownIds.current.add(m.id));
        setMessages(prev => [...prev, ...newMsgs]);
      }
    } catch { /* silent */ }
  }, [adminPw]);

  useEffect(() => {
    if (!selected) return;
    knownIds.current = new Set();
    setMessages([]);
    loadInitial(selected);
  }, [selected]);

  // Poll every 5 seconds silently
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => pollMessages(selected), 5000);
    return () => clearInterval(interval);
  }, [selected, pollMessages]);

  // Auto-scroll only when new message added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    if (!text.trim() || !selected || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${apiBase}/api/projects/${selected}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminPw },
        body: JSON.stringify({
          type: "text", content: text,
          senderName: "T/R Agency Team", sender: "admin",
        }),
      });
      const data = await res.json();
      if (data.ok && data.message) {
        knownIds.current.add(data.message.id);
        setMessages(prev => [...prev, data.message]);
        setText("");
      }
    } catch (e) { console.error(e); }
    setSending(false);
  }

  async function handleImageSend(e) {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setSending(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${apiBase}/api/projects/${selected}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": adminPw },
          body: JSON.stringify({
            type: "image", content: reader.result,
            senderName: "T/R Agency Team", sender: "admin",
          }),
        });
        const data = await res.json();
        if (data.ok && data.message) {
          knownIds.current.add(data.message.id);
          setMessages(prev => [...prev, data.message]);
        }
      } catch (e) { console.error(e); }
      setSending(false);
    };
    reader.readAsDataURL(file);
  }

  const selectedProject = projectList.find(p => p.id === selected);

  return (
    <div style={{
      display: "flex", height: "calc(100vh - 120px)", minHeight: 400,
      border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden",
    }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: 220, minWidth: 180, background: "#080808",
        borderRight: "1px solid #111",
        display: "flex", flexDirection: "column",
        flexShrink: 0,
      }}>
        <div style={{
          padding: "14px 14px 10px",
          borderBottom: "1px solid #111",
        }}>
          <div style={{ fontSize: 10, color: "#38bdf8", fontWeight: 700, letterSpacing: "0.1em" }}>
            THREADS
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {projectList.length === 0 ? (
            <div style={{ padding: 16, color: "#333", fontSize: 12, textAlign: "center" }}>
              No projects
            </div>
          ) : projectList.map(p => {
            const unreadCount = (p.messages || []).filter(m => !m.read && m.sender === "client").length;
            const lastMsg = (p.messages || []).slice(-1)[0];
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "11px 14px",
                  background: selected === p.id ? "#38bdf80a" : "transparent",
                  border: "none",
                  borderBottom: "1px solid #0d0d0d",
                  borderLeft: selected === p.id ? "2px solid #38bdf8" : "2px solid transparent",
                  cursor: "pointer", transition: "all 0.12s",
                }}
                onMouseEnter={e => { if (selected !== p.id) e.currentTarget.style.background = "#ffffff04"; }}
                onMouseLeave={e => { if (selected !== p.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "#38bdf8", fontWeight: 700, fontFamily: "monospace" }}>
                    {p.id}
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: "#000",
                      background: "#38bdf8", borderRadius: 10,
                      padding: "1px 6px", minWidth: 16, textAlign: "center",
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 11, color: selected === p.id ? "#ccc" : "#666",
                  fontWeight: 600, marginBottom: 2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {p.service?.slice(0, 22)}{(p.service?.length || 0) > 22 ? "…" : ""}
                </div>
                {lastMsg && (
                  <div style={{
                    fontSize: 10, color: "#333",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {lastMsg.sender === "admin" ? "You: " : ""}
                    {lastMsg.type === "image" ? "📷 Image" : lastMsg.content?.slice(0, 24)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0b0b0b", minWidth: 0 }}>
        {!selected ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", color: "#2a2a2a", gap: 8,
          }}>
            <div style={{ fontSize: 36 }}>💬</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Select a thread</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: "12px 16px", borderBottom: "1px solid #111",
              background: "#080808", display: "flex", alignItems: "center", gap: 10,
              flexShrink: 0,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 900, color: "#000", flexShrink: 0,
              }}>
                {selectedProject?.name?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedProject?.name}
                </div>
                <div style={{ fontSize: 10, color: "#38bdf8", marginTop: 1 }}>
                  {selectedProject?.id} · {selectedProject?.service?.slice(0, 28)}
                </div>
              </div>
              <StatusBadge status={selectedProject?.status} />
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: "14px 16px",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {initialLoad ? (
                <div style={{ textAlign: "center", color: "#333", padding: 40, fontSize: 12 }}>
                  Loading messages…
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  color: "#2a2a2a", gap: 6, paddingTop: 60,
                }}>
                  <div style={{ fontSize: 28 }}>✉️</div>
                  <div style={{ fontSize: 12, color: "#333" }}>No messages yet</div>
                  <div style={{ fontSize: 11, color: "#222" }}>Send the first message to the client</div>
                </div>
              ) : messages.map(msg => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div key={msg.id} style={{
                    display: "flex",
                    justifyContent: isAdmin ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "72%",
                      background: isAdmin
                        ? "linear-gradient(135deg,#38bdf8,#0ea5e9)"
                        : "#1a1a1a",
                      color: isAdmin ? "#000" : "#ccc",
                      borderRadius: isAdmin ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                      padding: msg.type === "image" ? "4px" : "9px 13px",
                      fontSize: 13, lineHeight: 1.45,
                      boxShadow: isAdmin ? "0 2px 8px rgba(56,189,248,0.2)" : "none",
                    }}>
                      {msg.type === "image" ? (
                        <img src={msg.content} alt="img" style={{
                          maxWidth: "100%", borderRadius: 10,
                          display: "block", maxHeight: 220,
                        }}/>
                      ) : (
                        <div style={{ wordBreak: "break-word" }}>{msg.content}</div>
                      )}
                      <div style={{
                        fontSize: 10, marginTop: msg.type === "image" ? 3 : 5,
                        opacity: 0.55, textAlign: "right",
                        padding: msg.type === "image" ? "0 6px 4px" : "0",
                        color: isAdmin ? "rgba(0,0,0,0.7)" : "#555",
                      }}>
                        {fmtShort(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div style={{
              padding: "10px 12px",
              borderTop: "1px solid #111", background: "#080808",
              display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0,
            }}>
              {/* Image upload */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={sending}
                style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: "#1a1a1a", border: "1px solid #222",
                  color: "#555", cursor: sending ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!sending) { e.currentTarget.style.borderColor = "#38bdf8"; e.currentTarget.style.color = "#38bdf8"; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#555"; }}
              >
                📎
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSend} style={{ display: "none" }}/>

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyPress={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Reply to client…"
                rows={1}
                disabled={sending}
                style={{
                  flex: 1, padding: "9px 12px", borderRadius: 8,
                  border: "1px solid #1e1e1e", background: "#111",
                  color: "#fff", fontSize: 13, fontFamily: "inherit",
                  outline: "none", resize: "none", maxHeight: 100, overflowY: "auto",
                  transition: "border-color 0.15s", lineHeight: 1.4,
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#38bdf8"}
                onBlur={e => e.currentTarget.style.borderColor = "#1e1e1e"}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: text.trim() && !sending
                    ? "linear-gradient(135deg,#38bdf8,#0ea5e9)" : "#1a1a1a",
                  border: "none", color: "#000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: text.trim() && !sending ? "pointer" : "not-allowed",
                  opacity: text.trim() && !sending ? 1 : 0.4,
                  transition: "all 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Admin ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const [adminPw,          setAdminPw         ] = useState(getAdminKey());
  const [projects,         setProjects        ] = useState([]);
  const [loading,          setLoading         ] = useState(false);
  const [updating,         setUpdating        ] = useState(null);
  const [filter,           setFilter          ] = useState("all");
  const [expandedPayment,  setExpandedPayment ] = useState(null);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [activeTab,        setActiveTab       ] = useState("projects");
  const [search,           setSearch          ] = useState("");
  const [mobileMenu,       setMobileMenu      ] = useState(false);

  async function loadProjects(pw) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/projects/all`, { headers: { "x-admin-key": pw } });
      const data = await res.json();
      if (data.ok) setProjects(data.projects);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { if (adminPw) loadProjects(adminPw); }, [adminPw]);

  // Silent project refresh every 20s — no flicker
  useEffect(() => {
    if (!adminPw) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/projects/all`, { headers: { "x-admin-key": adminPw } });
        const data = await res.json();
        if (data.ok) {
          setProjects(prev => {
            // Merge: update existing, add new
            const map = new Map(prev.map(p => [p.id, p]));
            data.projects.forEach(p => map.set(p.id, { ...map.get(p.id), ...p }));
            return data.projects.map(p => map.get(p.id));
          });
        }
      } catch { /* silent */ }
    }, 20000);
    return () => clearInterval(interval);
  }, [adminPw]);

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const res = await fetch(`${apiBase}/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminPw },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ok) setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (e) { console.error(e); }
    setUpdating(null);
  }

  async function confirmPayment(id) {
    setUpdating(id);
    try {
      const res = await fetch(`${apiBase}/api/projects/${id}/confirm-payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminPw },
      });
      const data = await res.json();
      if (data.ok) {
        setProjects(prev => prev.map(p =>
          p.id === id ? { ...p, payment: { ...p.payment, status: "paid" } } : p
        ));
        setExpandedPayment(null);
      }
    } catch (e) { console.error(e); }
    setUpdating(null);
  }

  async function rejectPayment(id) {
    setUpdating(id);
    try {
      const res = await fetch(`${apiBase}/api/projects/${id}/reject-payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminPw },
      });
      const data = await res.json();
      if (data.ok) {
        setProjects(prev => prev.map(p =>
          p.id === id ? { ...p, payment: { ...p.payment, status: "rejected" } } : p
        ));
        setExpandedPayment(null);
      }
    } catch (e) { console.error(e); }
    setUpdating(null);
  }

  function handleLogout() { clearAdminKey(); setAdminPw(""); setProjects([]); }

  if (!adminPw) return <AdminLogin onLogin={pw => setAdminPw(pw)} />;

  const counts = {
    all:                    projects.length,
    active:                 projects.filter(p => p.status === "active").length,
    "in-analysis":          projects.filter(p => p.status === "in-analysis").length,
    "pending-delivery":     projects.filter(p => p.status === "pending-delivery").length,
    completed:              projects.filter(p => p.status === "completed").length,
    "pending-cancellation": projects.filter(p => p.status === "pending-cancellation").length,
    cancelled:              projects.filter(p => p.status === "cancelled").length,
    "pending-payments":     projects.filter(p => p.payment?.status === "pending").length,
    paid:                   projects.filter(p => p.payment?.status === "paid").length,
  };

  let filtered = projects;
  if (filter === "pending-payments") filtered = projects.filter(p => p.payment?.status === "pending");
  else if (filter !== "all") filtered = projects.filter(p => p.status === filter);

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.id?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.service?.toLowerCase().includes(q)
    );
  }

  const TABS = [
    { id: "projects", label: "Projects", count: counts.all },
    { id: "messages", label: "Messages", count: null },
  ];

  return (
    <section style={{ minHeight: "100vh", background: "#050505" }}>

      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,8,8,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #111",
        padding: "0 16px",
        display: "flex", alignItems: "center", gap: 0,
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "13px 0", marginRight: 20, flexShrink: 0,
        }}>
          <div style={{
            width: 26, height: 26,
            background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
            borderRadius: 6, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#000",
          }}>T</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>T/R Agency</span>
          <span style={{
            fontSize: 9, color: "#38bdf8", border: "1px solid #38bdf833",
            background: "#38bdf811", borderRadius: 4, padding: "1px 5px",
            fontWeight: 700, letterSpacing: "0.06em",
          }}>OPS</span>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", flex: 1 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "14px 14px",
              background: "transparent", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #38bdf8" : "2px solid transparent",
              color: activeTab === tab.id ? "#fff" : "#444",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              transition: "all 0.12s",
              display: "flex", gap: 5, alignItems: "center", flexShrink: 0,
            }}>
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  fontSize: 9, background: activeTab === tab.id ? "#38bdf822" : "#1a1a1a",
                  color: activeTab === tab.id ? "#38bdf8" : "#444",
                  borderRadius: 10, padding: "1px 6px", fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {counts["pending-payments"] > 0 && (
            <div style={{
              fontSize: 10, color: "#38bdf8", background: "#38bdf811",
              border: "1px solid #38bdf833", borderRadius: 6,
              padding: "3px 8px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              💰 <span style={{ display: "none" }}>{counts["pending-payments"]} pending</span>
              <span>{counts["pending-payments"]}</span>
            </div>
          )}
          <button onClick={() => loadProjects(adminPw)} style={{
            padding: "5px 10px", borderRadius: 6, border: "1px solid #1e1e1e",
            background: "transparent", color: "#555", fontSize: 11, cursor: "pointer",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; }}
          >↻</button>
          <button onClick={handleLogout} style={{
            padding: "5px 10px", borderRadius: 6, border: "1px solid #ff444422",
            background: "transparent", color: "#ff6b6b", fontSize: 11, cursor: "pointer",
          }}>Out</button>
        </div>
      </div>

      <div style={{ padding: "16px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── PROJECTS TAB ── */}
        {activeTab === "projects" && (
          <>
            {/* Stats — horizontal scroll on mobile */}
            <div style={{
              display: "flex", gap: 8, marginBottom: 16,
              overflowX: "auto", paddingBottom: 4,
            }}>
              {[
                { label: "Total",    value: counts.all,               color: "#fff" },
                { label: "Active",   value: counts.active,            color: "#38bdf8" },
                { label: "Analysis", value: counts["in-analysis"],    color: "#a78bfa" },
                { label: "Delivery", value: counts["pending-delivery"],color: "#ffaa00" },
                { label: "Done",     value: counts.completed,         color: "#4ade80" },
                { label: "Pending$", value: counts["pending-payments"],color: "#38bdf8" },
                { label: "Paid",     value: counts.paid,              color: "#4ade80" },
                { label: "Cancel",   value: counts.cancelled,         color: "#6b7280" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "#0d0d0d", border: "1px solid #161616",
                  borderRadius: 10, padding: "12px 14px", flexShrink: 0, minWidth: 70,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 10, color: "#3a3a3a", marginTop: 3, fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Search bar */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, ID, service…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#0d0d0d", border: "1px solid #1a1a1a",
                  borderRadius: 8, padding: "9px 14px 9px 36px",
                  color: "#fff", fontSize: 13, outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#38bdf8"}
                onBlur={e => e.currentTarget.style.borderColor = "#1a1a1a"}
              />
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", fontSize: 14, color: "#444",
              }}>🔍</span>
              {search && (
                <button onClick={() => setSearch("")} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14,
                }}>✕</button>
              )}
            </div>

            {/* Filter pills — scroll on mobile */}
            <div style={{
              display: "flex", gap: 6, marginBottom: 16,
              overflowX: "auto", paddingBottom: 4,
            }}>
              {[
                { key: "all",                  label: `All (${counts.all})` },
                { key: "active",               label: `Active` },
                { key: "in-analysis",          label: `Analysis` },
                { key: "pending-delivery",     label: `Delivery` },
                { key: "completed",            label: `Done` },
                { key: "pending-cancellation", label: `Cancel` },
                { key: "cancelled",            label: `Cancelled` },
                { key: "pending-payments",     label: `💰 Payments` },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  border: `1px solid ${filter === f.key ? "#38bdf8" : "#1a1a1a"}`,
                  background: filter === f.key ? "#38bdf811" : "transparent",
                  color: filter === f.key ? "#38bdf8" : "#444",
                  cursor: "pointer", transition: "all 0.12s", flexShrink: 0,
                }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Results count */}
            {search && (
              <div style={{ fontSize: 11, color: "#444", marginBottom: 10 }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
              </div>
            )}

            {/* Project cards */}
            {loading ? (
              <div style={{ textAlign: "center", color: "#333", padding: 60, fontSize: 13 }}>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                textAlign: "center", color: "#333", padding: 60,
                background: "#0d0d0d", border: "1px solid #161616", borderRadius: 12, fontSize: 13,
              }}>
                {search ? `No results for "${search}"` : "No projects here."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map(p => (
                  <div key={p.id}>

                    {/* ── Project card ── */}
                    <div style={{
                      background: "#0d0d0d", border: "1px solid #161616",
                      borderRadius: 12, padding: "14px 16px",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#222"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#161616"}
                    >
                      {/* Top row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8", fontFamily: "monospace" }}>
                              {p.id}
                            </span>
                            <StatusBadge status={p.status || "active"} />
                            {p.payment?.status && <PaymentBadge status={p.payment.status} />}
                            {p.feedback && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, color: "#ffaa00",
                                border: "1px solid #ffaa0033", background: "#ffaa0011",
                                borderRadius: 4, padding: "2px 6px",
                              }}>
                                ⭐ {p.feedback.rating}/5
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                            {p.service}
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "#3a3a3a" }}>
                            <span>👤 {p.name}</span>
                            <span>✉ {p.email}</span>
                            <span>🕐 {timeAgo(p.submittedAt)}</span>
                            {p.price && p.price !== "—" && <span>💰 {p.price}</span>}
                          </div>
                          {p.mainIssue && (
                            <div style={{
                              marginTop: 8, fontSize: 11, color: "#444",
                              background: "#111", borderRadius: 6, padding: "6px 10px",
                              borderLeft: "2px solid #1e1e1e", lineHeight: 1.5,
                            }}>
                              {p.mainIssue.slice(0, 120)}{p.mainIssue.length > 120 ? "…" : ""}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start", flexShrink: 0 }}>
                          {(p.status === "active" || !p.status) && (
                            <button onClick={() => updateStatus(p.id, "in-analysis")} disabled={updating === p.id}
                              style={{
                                padding: "6px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                                border: "1px solid #a78bfa33", background: "#a78bfa0d",
                                color: "#a78bfa", cursor: "pointer", opacity: updating === p.id ? 0.5 : 1,
                              }}>
                              ▶ Analyse
                            </button>
                          )}
                          {p.status === "in-analysis" && (
                            <button onClick={() => updateStatus(p.id, "pending-delivery")} disabled={updating === p.id}
                              style={{
                                padding: "6px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                                border: "1px solid #ffaa0033", background: "#ffaa000d",
                                color: "#ffaa00", cursor: "pointer", opacity: updating === p.id ? 0.5 : 1,
                              }}>
                              📤 Deliver
                            </button>
                          )}
                          {p.status === "pending-delivery" && (
                            <span style={{ fontSize: 11, color: "#ffaa00", fontWeight: 700, padding: "6px 0" }}>
                              ⏳ Awaiting
                            </span>
                          )}
                          {p.status === "pending-cancellation" && (
                            <div style={{ display: "flex", gap: 5 }}>
                              <button onClick={() => updateStatus(p.id, "cancelled")} disabled={updating === p.id}
                                style={{
                                  padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                                  border: "1px solid #ff666633", background: "#ff66660d",
                                  color: "#ff6666", cursor: "pointer",
                                }}>
                                ✓ Cancel
                              </button>
                              <button onClick={() => updateStatus(p.id, "in-analysis")} disabled={updating === p.id}
                                style={{
                                  padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                                  border: "1px solid #4ade8033", background: "#4ade800d",
                                  color: "#4ade80", cursor: "pointer",
                                }}>
                                ✗ Deny
                              </button>
                            </div>
                          )}
                          {p.status === "completed" && (
                            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>✓ Done</span>
                          )}
                          {p.status === "cancelled" && (
                            <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 700 }}>✕ Cancelled</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment pending */}
                    {p.payment?.status === "pending" && (
                      <div style={{
                        background: "#38bdf805", border: "1px solid #38bdf822",
                        borderRadius: 10, padding: "12px 16px", marginTop: 5,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>
                              💰 Payment Pending Verification
                            </div>
                            <div style={{ fontSize: 10, color: "#38bdf8aa", display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <span>{p.payment.amount} {p.payment.currency}</span>
                              <span>{p.payment.method}</span>
                              <span>{timeAgo(p.payment.requested_at)}</span>
                            </div>
                          </div>
                          <button onClick={() => setExpandedPayment(expandedPayment === p.id ? null : p.id)}
                            style={{
                              padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                              border: "1px solid #38bdf833", background: "#38bdf811",
                              color: "#38bdf8", cursor: "pointer",
                            }}>
                            {expandedPayment === p.id ? "Hide" : "View"}
                          </button>
                        </div>
                        {expandedPayment === p.id && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #38bdf822" }}>
                            {p.payment.receiptImage && (
                              <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 10, color: "#38bdf8aa", fontWeight: 700, marginBottom: 6 }}>RECEIPT</div>
                                <img src={p.payment.receiptImage} alt="Receipt" style={{
                                  maxWidth: "100%", maxHeight: 260, borderRadius: 8,
                                  border: "1px solid #38bdf833",
                                }}/>
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => confirmPayment(p.id)} disabled={updating === p.id}
                                style={{
                                  flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                  border: "1px solid #4ade8033", background: "#4ade8011",
                                  color: "#4ade80", cursor: "pointer", opacity: updating === p.id ? 0.5 : 1,
                                }}>
                                {updating === p.id ? "…" : "✅ Confirm"}
                              </button>
                              <button onClick={() => rejectPayment(p.id)} disabled={updating === p.id}
                                style={{
                                  flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                  border: "1px solid #ff444433", background: "#ff444408",
                                  color: "#ff6b6b", cursor: "pointer", opacity: updating === p.id ? 0.5 : 1,
                                }}>
                                ❌ Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paid */}
                    {p.payment?.status === "paid" && (
                      <div style={{
                        background: "#4ade8005", border: "1px solid #4ade8022",
                        borderRadius: 10, padding: "9px 16px", marginTop: 5,
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span>✅</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>
                          Payment Confirmed
                        </span>
                        <span style={{ fontSize: 10, color: "#4ade8055" }}>
                          {p.payment.amount} {p.payment.currency} · {timeAgo(p.payment.confirmed_at || p.payment.requested_at)}
                        </span>
                      </div>
                    )}

                    {/* Feedback */}
                    {p.feedback && (
                      <div style={{
                        background: "#ffaa0805", border: "1px solid #ffaa0822",
                        borderRadius: 10, padding: "12px 16px", marginTop: 5,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#ffaa00" }}>⭐ Feedback</span>
                            <span style={{ fontSize: 10, color: "#ffaa0077", marginLeft: 8 }}>
                              {p.feedback.rating}/5 · {timeAgo(p.feedback.submitted_at)}
                            </span>
                          </div>
                          <button onClick={() => setExpandedFeedback(expandedFeedback === p.id ? null : p.id)}
                            style={{
                              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                              border: "1px solid #ffaa0033", background: "#ffaa0011",
                              color: "#ffaa00", cursor: "pointer",
                            }}>
                            {expandedFeedback === p.id ? "Hide" : "Read"}
                          </button>
                        </div>
                        {expandedFeedback === p.id && p.feedback.comment && (
                          <div style={{
                            marginTop: 10, paddingTop: 10, borderTop: "1px solid #ffaa0822",
                            fontSize: 12, color: "#ffaa00cc", lineHeight: 1.6, fontStyle: "italic",
                          }}>
                            "{p.feedback.comment}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === "messages" && (
          <MessagesPanel projects={projects} adminPw={adminPw} />
        )}

      </div>
    </section>
  );
}
