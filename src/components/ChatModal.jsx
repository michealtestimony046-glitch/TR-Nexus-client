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

// ── Telegram-style background pattern ────────────────────────────────────────
const BG_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2338bdf8' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark admin messages read
  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.read && msg.sender === "admin") {
        markMessageRead(projectId, msg.id).catch(() => {});
      }
    });
  }, []);

  // ── Send text ─────────────────────────────────────────────────────────────
  async function handleSend() {
    if (!text.trim() || !session) return;
    setSending(true);
    const res = await sendMessage(projectId, "text", text, session.name);
    if (res.ok) { setMessages(prev => [...prev, res.message]); setText(""); }
    setSending(false);
  }

  // ── Upload image ──────────────────────────────────────────────────────────
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

  // ── Upload audio file ─────────────────────────────────────────────────────
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

  // ── Voice recording ───────────────────────────────────────────────────────
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
    if (mediaRecRef.current) {
      mediaRecRef.current.stop();
      mediaRecRef.current = null;
    }
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
    window.open("https://calendly.com/tragency-ops-proton/30min", "_blank");
  }

  const fmtSecs = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      display: "flex", flexDirection: "column",
      background: "#0a0f1a",
    }}>

      {/* ── Tiled background (Telegram-style) ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: BG_PATTERN,
        backgroundSize: "60px 60px",
        opacity: 0.6,
        pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{
        position: "relative", zIndex: 2,
        background: "rgba(10, 15, 26, 0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(56,189,248,0.12)",
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Back / Close */}
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)", border: "none",
            color: "#38bdf8", cursor: "pointer",
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          ←
        </button>

        {/* Avatar */}
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "#000", flexShrink: 0,
          boxShadow: "0 0 0 2px rgba(56,189,248,0.3)",
        }}>
          T
        </div>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 800, color: "#fff",
            letterSpacing: "0.01em", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            Project Discussion
          </div>
          <div style={{ fontSize: 11, color: "#38bdf8", marginTop: 1, fontWeight: 500 }}>
            T/R Agency Team · online
          </div>
        </div>

        {/* Call button */}
        <button
          onClick={handleScheduleCall}
          title="Schedule a call"
          style={{
            background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
            color: "#38bdf8", cursor: "pointer",
            width: 38, height: 38, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(56,189,248,0.2)";
            e.currentTarget.style.transform = "scale(1.06)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(56,189,248,0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {/* Phone SVG */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
          </svg>
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
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(56,189,248,0.08)",
              border: "1px solid rgba(56,189,248,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, marginBottom: 4,
            }}>
              💬
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
                    ? "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)"
                    : "rgba(255,255,255,0.07)",
                  backdropFilter: isMe ? "none" : "blur(12px)",
                  border: isMe
                    ? "none"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: isMe ? "#000" : "#e8eaf0",
                  borderRadius: isMe
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  padding: msg.type === "image" ? "4px" : "10px 14px",
                  boxShadow: isMe
                    ? "0 2px 12px rgba(56,189,248,0.25)"
                    : "0 1px 4px rgba(0,0,0,0.3)",
                }}>
                  {showName && (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: "#38bdf8",
                      marginBottom: 4,
                    }}>
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
                      style={{
                        maxWidth: "100%", borderRadius: 14,
                        display: "block", maxHeight: 280,
                      }}
                    />
                  )}
                  {msg.type === "voice" && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "2px 0", minWidth: 160,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: isMe ? "rgba(0,0,0,0.15)" : "rgba(56,189,248,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        🎤
                      </div>
                      <audio
                        src={msg.content}
                        controls
                        style={{
                          height: 28, flex: 1,
                          filter: isMe ? "invert(1)" : "none",
                          opacity: 0.9,
                        }}
                      />
                    </div>
                  )}
                  {msg.type === "audio" && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "2px 0", minWidth: 180,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: isMe ? "rgba(0,0,0,0.15)" : "rgba(56,189,248,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        🎵
                      </div>
                      <audio src={msg.content} controls style={{ height: 28, flex: 1 }} />
                    </div>
                  )}
                  {/* Timestamp + tick */}
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
                    <div style={{
                      fontSize: 10, padding: "3px 8px 4px",
                      color: "rgba(255,255,255,0.7)",
                      textAlign: "right",
                    }}>
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

      {/* ── Attach sheet (slides up) ── */}
      {showAttach && (
        <div style={{
          position: "absolute", bottom: 72, left: 0, right: 0, zIndex: 10,
          background: "rgba(10,15,26,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(56,189,248,0.12)",
          padding: "20px 16px 24px",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
          }}>
            {/* Image/Gallery */}
            <label style={{ cursor: "pointer" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, boxShadow: "0 4px 12px rgba(167,139,250,0.3)",
                }}>
                  🖼️
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                  Gallery
                </span>
              </div>
              <input
                type="file" accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>

            {/* File */}
            <label style={{ cursor: "pointer" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, boxShadow: "0 4px 12px rgba(56,189,248,0.3)",
                }}>
                  📁
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                  File
                </span>
              </div>
              <input
                type="file" accept="*/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>

            {/* Audio */}
            <label style={{ cursor: "pointer" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #4ade80, #22c55e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, boxShadow: "0 4px 12px rgba(74,222,128,0.3)",
                }}>
                  🎵
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                  Audio
                </span>
              </div>
              <input
                type="file" accept="audio/*"
                onChange={handleAudioUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Close attach sheet */}
          <button
            onClick={() => setShowAttach(false)}
            style={{
              width: "100%", marginTop: 20, padding: "10px 0",
              borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
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
        background: "rgba(10,15,26,0.92)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(56,189,248,0.08)",
        padding: "10px 12px",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
      }}>
        {/* Recording state */}
        {recording ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "4px 0",
          }}>
            <button
              onClick={cancelRecording}
              style={{
                background: "none", border: "none",
                color: "#ff6b6b", fontSize: 20, cursor: "pointer", padding: 4,
              }}
            >
              🗑️
            </button>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.06)", borderRadius: 24,
              padding: "8px 16px",
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#ff4444", flexShrink: 0,
                animation: "pulse-ring 1s infinite",
              }} />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, flex: 1 }}>
                Recording…
              </span>
              <span style={{ color: "#38bdf8", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>
                {fmtSecs(recordSecs)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                border: "none", color: "#000",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(56,189,248,0.4)",
              }}
            >
              ✓
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {/* Attach (pin) */}
            <button
              onClick={() => setShowAttach(v => !v)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: showAttach ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${showAttach ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: showAttach ? "#38bdf8" : "rgba(255,255,255,0.5)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = showAttach ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.06)"; }}
            >
              {/* Pin SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21.44" y1="11.05" x2="9.5" y2="23" />
                <path d="M20.12 5.54L18.46 3.88A2 2 0 0015.64 4L7.58 12.06l-3.13.87-.87 3.13 8.06-8.06a2 2 0 00.12-2.82L10.38 3.7a2 2 0 00-2.82.12L.88 11l3.13-.87.87-3.13" />
              </svg>
            </button>

            {/* Text input */}
            <div style={{
              flex: 1, position: "relative",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, overflow: "hidden",
              transition: "border-color 0.15s",
            }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.parentElement.style.borderColor = "rgba(56,189,248,0.3)";
                }}
                onBlur={(e) => {
                  e.currentTarget.parentElement.style.borderColor = "rgba(255,255,255,0.08)";
                }}
                placeholder="Message…"
                rows={1}
                disabled={sending}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px",
                  background: "transparent", border: "none",
                  color: "#fff", fontSize: 14, fontFamily: "inherit",
                  resize: "none", outline: "none",
                  maxHeight: 120, overflowY: "auto",
                  lineHeight: 1.4,
                }}
              />
            </div>

            {/* Send OR Mic */}
            {text.trim() ? (
              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                  border: "none", color: "#000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.6 : 1,
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(56,189,248,0.35)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!sending) e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {/* Send arrow SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                </svg>
              </button>
            ) : (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: recording
                    ? "linear-gradient(135deg, #ff4444, #cc0000)"
                    : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: recording ? "#fff" : "rgba(255,255,255,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {/* Mic SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
