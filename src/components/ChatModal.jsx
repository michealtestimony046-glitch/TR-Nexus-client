import React, { useState, useRef, useEffect } from "react";
import { getSession } from "../auth.js";

async function sendMessage(projectId, type, content, senderName) {
  const s = getSession();
  if (!s) return { ok: false };
  const res = await fetch(`/api/projects/${projectId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${s.token}`,
    },
    body: JSON.stringify({ type, content, senderName }),
  });
  return res.json();
}

async function markMessageRead(projectId, msgId) {
  const s = getSession();
  if (!s) return { ok: false };
  const res = await fetch(`/api/projects/${projectId}/messages/${msgId}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${s.token}` },
  });
  return res.json();
}

function fmt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday
    ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const IcoImage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);

const IcoFile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IcoAudio = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const IcoMic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const IcoSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IcoPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21.44" y1="11.05" x2="9.5" y2="22.99"/>
    <path d="M5 2L2 5l7.07 7.07-2.5 2.5L12 22l5.27-5.27 7.16 7.16 2.97-2.97-9.1-9.1 2.27-2.27z"/>
  </svg>
);

const IcoChat = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcoPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);

const IcoBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IcoTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function ChatModal({ projectId, messages, setMessages, onClose }) {
  const [text, setText]               = useState("");
  const [sending, setSending]         = useState(false);
  const [showAttach, setShowAttach]   = useState(false);
  const [recording, setRecording]     = useState(false);
  const [recordSecs, setRecordSecs]   = useState(0);

  const messagesEndRef  = useRef(null);
  const fileInputRef    = useRef(null);
  const audioInputRef   = useRef(null);
  const mediaRecRef     = useRef(null);
  const recordTimer     = useRef(null);
  const session         = getSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.read && msg.sender === "admin") {
        markMessageRead(projectId, msg.id).catch(() => {});
      }
    });
  }, []);

  async function handleSend() {
    if (!text.trim() || !session) return;
    setSending(true);
    const res = await sendMessage(projectId, "text", text, session.name);
    if (res.ok) { setMessages(prev => [...prev, res.message]); setText(""); }
    setSending(false);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setSending(true);
    setShowAttach(false);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await sendMessage(projectId, "image", reader.result, session.name);
      if (res.ok) setMessages(prev => [...prev, res.message]);
      setSending(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleAudioUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setSending(true);
    setShowAttach(false);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await sendMessage(projectId, "audio", reader.result, session.name);
      if (res.ok) setMessages(prev => [...prev, res.message]);
      setSending(false);
    };
    reader.readAsDataURL(file);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          const res = await sendMessage(projectId, "voice", reader.result, session.name);
          if (res.ok) setMessages(prev => [...prev, res.message]);
          setSending(false);
        };
        reader.readAsDataURL(blob);
      };
      rec.start();
      mediaRecRef.current = rec;
      setRecording(true);
      setRecordSecs(0);
      recordTimer.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
    } catch {
      alert("Microphone permission denied.");
    }
  }

  function stopRecording() {
    if (mediaRecRef.current) { mediaRecRef.current.stop(); mediaRecRef.current = null; }
    clearInterval(recordTimer.current);
    setRecording(false);
    setSending(true);
  }

  function cancelRecording() {
    if (mediaRecRef.current) {
      mediaRecRef.current.ondataavailable = null;
      mediaRecRef.current.onstop = null;
      mediaRecRef.current.stop();
      mediaRecRef.current = null;
    }
    clearInterval(recordTimer.current);
    setRecording(false);
  }

  function handleScheduleCall() {
    window.open("https://discord.gg/G5cTHe87uQ", "_blank");
  }

  const fmtSecs = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const glassPanel = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      display: "flex", flexDirection: "column",
      background: "rgba(4,8,18,0.65)",
      backdropFilter: "blur(48px) saturate(180%)",
      WebkitBackdropFilter: "blur(48px) saturate(180%)",
    }}>

      {/* Subtle dot grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(rgba(56,189,248,0.08) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* Glow blobs */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
        filter: "blur(60px)", top: "-20%", left: "-10%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)",
        filter: "blur(60px)", bottom: "0%", right: "-10%", pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{
        position: "relative", zIndex: 2,
        ...glassPanel,
        borderLeft: "none", borderRight: "none", borderTop: "none",
        borderBottom: "1px solid rgba(56,189,248,0.12)",
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={onClose}
          style={{
            ...glassPanel,
            color: "#38bdf8", cursor: "pointer",
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
        >
          <IcoBack />
        </button>

        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(56,189,248,0.3), rgba(14,165,233,0.2))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(56,189,248,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 0 16px rgba(56,189,248,0.2)",
        }}>
          <IcoChat />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 800, color: "#f1f5f9",
            letterSpacing: "0.01em", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            Project Discussion
          </div>
          <div style={{ fontSize: 11, color: "#38bdf8", marginTop: 1, fontWeight: 500 }}>
            T/R Agency Team · online
          </div>
        </div>

        <button
          onClick={handleScheduleCall}
          title="Join Discord"
          style={{
            ...glassPanel,
            color: "#38bdf8", cursor: "pointer",
            width: 38, height: 38, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(56,189,248,0.15)";
            e.currentTarget.style.transform = "scale(1.06)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <IcoPhone />
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        position: "relative", zIndex: 1,
        flex: 1, overflowY: "auto",
        padding: "16px 12px",
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.3)", fontSize: 13,
            textAlign: "center", gap: 8, padding: "60px 24px",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(56,189,248,0.06)",
              border: "1px solid rgba(56,189,248,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 4, color: "rgba(56,189,248,0.6)",
            }}>
              <IcoChat />
            </div>
            <div style={{ fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
              No messages yet
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
              Start the conversation with the T/R Agency team
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === "client";
            const prevMsg = messages[i - 1];
            const showName = !isMe && (!prevMsg || prevMsg.sender !== msg.sender);

            return (
              <div key={msg.id} style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 2,
              }}>
                <div style={{
                  maxWidth: "78%",
                  background: isMe
                    ? "linear-gradient(135deg, rgba(56,189,248,0.85) 0%, rgba(14,165,233,0.8) 100%)"
                    : "rgba(255,255,255,0.06)",
                  backdropFilter: isMe ? "none" : "blur(16px)",
                  WebkitBackdropFilter: isMe ? "none" : "blur(16px)",
                  border: isMe
                    ? "1px solid rgba(56,189,248,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: isMe ? "#000" : "#e8eaf0",
                  borderRadius: isMe
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  padding: msg.type === "image" ? "4px" : "10px 14px",
                  boxShadow: isMe
                    ? "0 4px 20px rgba(56,189,248,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.2)",
                }}>
                  {showName && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>
                      T/R Agency
                    </div>
                  )}
                  {msg.type === "text" && (
                    <div style={{ fontSize: 14, lineHeight: 1.45, wordBreak: "break-word" }}>
                      {msg.content}
                    </div>
                  )}
                  {msg.type === "image" && (
                    <img
                      src={msg.content}
                      alt="img"
                      style={{ maxWidth: "100%", borderRadius: 14, display: "block", maxHeight: 280 }}
                    />
                  )}
                  {(msg.type === "voice" || msg.type === "audio") && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "2px 0", minWidth: 160,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: isMe ? "rgba(0,0,0,0.15)" : "rgba(56,189,248,0.15)",
                        border: "1px solid rgba(56,189,248,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: isMe ? "#000" : "#38bdf8",
                      }}>
                        <IcoAudio />
                      </div>
                      <audio
                        src={msg.content}
                        controls
                        style={{ height: 28, flex: 1, filter: isMe ? "invert(1)" : "none", opacity: 0.9 }}
                      />
                    </div>
                  )}
                  {msg.type !== "image" && (
                    <div style={{
                      fontSize: 10, marginTop: 5,
                      color: isMe ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.35)",
                      textAlign: "right", display: "flex",
                      justifyContent: "flex-end", alignItems: "center", gap: 3,
                    }}>
                      {fmt(msg.timestamp)}
                      {isMe && (
                        <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                          <path d="M1 5l4 4L15 1" stroke="rgba(0,0,0,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  )}
                  {msg.type === "image" && (
                    <div style={{ fontSize: 10, padding: "3px 8px 4px", color: "rgba(255,255,255,0.7)", textAlign: "right" }}>
                      {fmt(msg.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Attach sheet ── */}
      {showAttach && (
        <div style={{
          position: "absolute", bottom: 72, left: 0, right: 0, zIndex: 10,
          background: "rgba(6,10,20,0.7)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderTop: "1px solid rgba(56,189,248,0.12)",
          padding: "20px 16px 24px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Photo", icon: <IcoImage />, accept: "image/*", handler: handleImageUpload, color: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.25)", iconColor: "#a78bfa" },
              { label: "File", icon: <IcoFile />, accept: "*/*", handler: handleImageUpload, color: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.2)", iconColor: "#38bdf8" },
              { label: "Audio", icon: <IcoAudio />, accept: "audio/*", handler: handleAudioUpload, color: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.2)", iconColor: "#4ade80" },
            ].map((item, i) => (
              <label key={i} style={{ cursor: "pointer" }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 18,
                    background: item.color,
                    border: `1px solid ${item.border}`,
                    backdropFilter: "blur(10px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: item.iconColor,
                    transition: "all .2s",
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                    {item.label}
                  </span>
                </div>
                <input
                  type="file"
                  accept={item.accept}
                  onChange={item.handler}
                  style={{ display: "none" }}
                />
              </label>
            ))}
          </div>

          <button
            onClick={() => setShowAttach(false)}
            style={{
              width: "100%", marginTop: 20, padding: "10px 0",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div style={{
        position: "relative", zIndex: 2,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        borderTop: "1px solid rgba(56,189,248,0.1)",
        padding: "10px 12px",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
      }}>
        {recording ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
            <button
              onClick={cancelRecording}
              style={{
                background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)",
                backdropFilter: "blur(10px)", borderRadius: "50%",
                width: 40, height: 40, color: "#ff6b6b", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <IcoTrash />
            </button>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "8px 16px",
              backdropFilter: "blur(10px)",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#ff4444", flexShrink: 0,
                animation: "pulse-ring 1s infinite",
              }} />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, flex: 1 }}>Recording…</span>
              <span style={{ color: "#38bdf8", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>
                {fmtSecs(recordSecs)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(56,189,248,0.2)", border: "1px solid rgba(56,189,248,0.35)",
                backdropFilter: "blur(10px)",
                color: "#38bdf8",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IcoCheck />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button
              onClick={() => setShowAttach(v => !v)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: showAttach ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${showAttach ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)"}`,
                backdropFilter: "blur(10px)",
                color: showAttach ? "#38bdf8" : "rgba(255,255,255,0.5)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              <IcoPin />
            </button>

            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 24,
              display: "flex", alignItems: "flex-end", gap: 0,
              overflow: "hidden",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Message T/R Agency…"
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e2e8f0", fontSize: 14, lineHeight: 1.5,
                  padding: "10px 14px", resize: "none", maxHeight: 140,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {text.trim() ? (
              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: sending ? "rgba(56,189,248,0.15)" : "rgba(56,189,248,0.2)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  backdropFilter: "blur(10px)",
                  color: "#38bdf8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: sending ? "not-allowed" : "pointer", flexShrink: 0,
                  transition: "all 0.15s",
                  boxShadow: "0 0 12px rgba(56,189,248,0.15)",
                }}
              >
                <IcoSend />
              </button>
            ) : (
              <button
                onMouseDown={startRecording}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                <IcoMic />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
