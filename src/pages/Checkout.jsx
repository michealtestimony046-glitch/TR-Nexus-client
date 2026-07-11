import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession } from "../auth.js";

// ── Glassmorphism tokens (matches ChatModal.jsx) ──────────────────────────────
const glassPanel = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const BG = () => (
  <>
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage: "radial-gradient(rgba(56,189,248,0.08) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }} />
    <div style={{
      position: "absolute", width: 500, height: 500, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
      filter: "blur(60px)", top: "-20%", left: "-10%", pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", width: 400, height: 400, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)",
      filter: "blur(60px)", bottom: "0%", right: "-10%", pointerEvents: "none",
    }} />
  </>
);

const PageShell = ({ children, center }) => (
  <div style={{
    position: "relative", minHeight: "100vh",
    background: "#040810",
    display: "flex", alignItems: center ? "center" : "flex-start",
    justifyContent: "center",
    padding: "24px 16px",
    overflow: "hidden",
  }}>
    <BG />
    <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  </div>
);

const GlassCard = ({ children, maxWidth = 420, accent = "#38bdf8" }) => (
  <div style={{
    ...glassPanel,
    borderRadius: 16,
    padding: 32,
    maxWidth,
    width: "100%",
    boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}0d`,
  }}>
    {children}
  </div>
);

const BackBtn = ({ onClick, children = "← Back", color = "#38bdf8" }) => (
  <button
    onClick={onClick}
    style={{
      background: "none", border: "none", color,
      cursor: "pointer", fontSize: 14, marginBottom: 20, fontWeight: 600,
      transition: "opacity 0.2s", padding: 0,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
  >
    {children}
  </button>
);

// ── Real brand-accurate logo marks for Fiverr / Upwork ────────────────────────
// Fiverr: green square, white "fi" ligature mark
// Upwork: white square, black "up" wordmark
// (Stylized recreations in true brand colors — not the exact vector artwork,
// but immediately recognizable, matching the reference screenshot provided.)
const FiverrLogo = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#1DBF73" />
    <text
      x="50" y="72"
      textAnchor="middle"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontSize="58"
      fontWeight="900"
      fill="#ffffff"
    >
      fi
    </text>
  </svg>
);

const UpworkLogo = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#ffffff" />
    <text
      x="50" y="68"
      textAnchor="middle"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontSize="42"
      fontWeight="900"
      fill="#0a0a0a"
      letterSpacing="-2"
    >
      up
    </text>
  </svg>
);

const IcoShield = ({ size = 22, color = "#38bdf8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5l-8-3z" />
  </svg>
);

const PAYMENT_METHODS = {
  "lead-bank": {
    name: "Lead Bank (USD)",
    currency: "USD",
    icon: "💵",
    details: {
      bank: "Lead Bank",
      accountHolder: "Omolara Temidayo Yusuf",
      // ⚠️ PENDING CONFIRMATION — two different digit counts have been given
      // for this account number so far (13 digits, then 12 digits). DO NOT
      // treat this as final until confirmed against an actual bank document
      // or screenshot. Replace the line below once confirmed.
      accountNumber: "212111728832", // ⚠️ CONFIRM BEFORE GOING LIVE
      accountType: "Checking",
      achRouting: "101019644",
      wireRouting: "101019644",
      address: "1801 Main St., Kansas City, MO 64108",
      type: "bank"
    }
  },
  gbp: {
    name: "Clear Junction (GBP)",
    currency: "GBP",
    icon: "💷",
    details: {
      bank: "Clear Junction Limited",
      accountHolder: "omolara temidayo yusuf",
      accountNumber: "42324764",
      sortCode: "041307",
      swift: "CLJUGB21XXX",
      address: "4th Floor Imperial House, 15 Kingsway, London, WC2B 6UN",
      type: "bank"
    }
  },
  eur: {
    name: "Clear Junction (EUR)",
    currency: "EUR",
    icon: "💶",
    details: {
      bank: "Clear Junction Limited",
      accountHolder: "omolara temidayo yusuf",
      accountNumber: "42324764",
      iban: "GB93CLJU04130742324764",
      swift: "CLJUGB21XXX",
      address: "4th Floor Imperial House, 15 Kingsway, London, WC2B 6UN",
      type: "bank"
    }
  },
  usdt: {
    name: "USDT (TRC20/Tron)",
    currency: "USDT",
    icon: "⚡",
    details: {
      network: "TRC20 (Tron)",
      wallet: "TJGdWbe1XHedM7qAyGstbXnkjx2KAZ46oD",
      type: "crypto",
      warning: "SEND USDT (TRC20) ONLY - NOT USDC, NOT ETHEREUM, NOT OTHER NETWORKS"
    }
  },
  usdc: {
    name: "USDC (Solana)",
    currency: "USDC",
    icon: "⚡",
    details: {
      network: "Solana",
      wallet: "DwZqUgRMMeSsqg7u3nYpcRXN2JCUFvKzjGSu4fkLTrijs",
      type: "crypto",
      warning: "SEND USDC (SOLANA) ONLY - NOT USDT, NOT ETHEREUM, NOT OTHER NETWORKS"
    }
  },
  escrow: {
    name: "Escrow (Upwork/Fiverr)",
    currency: "N/A",
    icon: "🛡️",
    details: { type: "escrow" }
  }
};

export default function Checkout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const session = getSession();

  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!session || !projectId) {
      navigate("/login");
      return;
    }
    fetchProjectInfo();
  }, [session, projectId]);

  useEffect(() => {
    if (step === "pending") {
      const interval = setInterval(checkPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [step]);

  async function fetchProjectInfo() {
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      const data = await res.json();
      if (data.ok) {
        const proj = data.projects.find(p => p.id === projectId);
        setProject(proj);
      }
    } catch (err) {
      console.error("Failed to fetch project info:", err);
    }
  }

  async function checkPaymentStatus() {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      const data = await res.json();
      if (data.ok && data.project.payment?.status === "paid") {
        setPaymentStatus("confirmed");
        setStep("success");
      }
    } catch (err) {
      console.error("Failed to check payment status:", err);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setError("Image too large (max 5MB)");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
    }
  }

  async function handleSubmitPayment() {
    if (!image) {
      setError("Please upload receipt image");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageData = reader.result;
          const res = await fetch(`/api/projects/${projectId}/payment-request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.token}`
            },
            body: JSON.stringify({
              amount: parseFloat(amount),
              currency,
              paymentMethod,
              receiptImage: imageData,
              timestamp: new Date().toISOString()
            })
          });
          const data = await res.json();
          if (data.ok) {
            setStep("pending");
            setPaymentStatus("pending");
          } else {
            setError(data.error || "Failed to submit payment");
            setLoading(false);
          }
        } catch (err) {
          console.error("Payment submission error:", err);
          setError("Error processing payment: " + err.message);
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file");
        setLoading(false);
      };
      reader.readAsDataURL(image);
    } catch (err) {
      console.error("File read error:", err);
      setError("Error uploading image");
      setLoading(false);
    }
  }

  if (!session) return null;
  if (!project) {
    return (
      <PageShell center>
        <div style={{ color: "#8aa", fontSize: 14 }}>Loading…</div>
      </PageShell>
    );
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14,
    marginBottom: 10, transition: "all 0.2s", outline: "none",
  };
  const focusBlue = (e) => {
    e.currentTarget.style.borderColor = "#38bdf8";
    e.currentTarget.style.background = "rgba(56,189,248,0.06)";
  };
  const blurReset = (e) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
  };

  // ── STEP 1: Amount ──────────────────────────────────────────────────────────
  if (step === "amount") {
    return (
      <PageShell center>
        <GlassCard>
          <BackBtn onClick={() => navigate("/portal")}>← Back to Portal</BackBtn>

          <div style={{ fontSize: 11, color: "#38bdf8", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>
            // CHECKOUT
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
            Complete Payment
          </h2>
          <p style={{ margin: "0 0 24px", color: "#8899aa", fontSize: 14 }}>
            {project.service}
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "#8899aa", marginBottom: 6, fontWeight: 600 }}>
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              style={inputStyle}
              onFocus={focusBlue}
              onBlur={blurReset}
            />
            <label style={{ display: "block", fontSize: 12, color: "#8899aa", marginBottom: 6, fontWeight: 600 }}>
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", marginBottom: 0 }}
              onFocus={focusBlue}
              onBlur={blurReset}
            >
              <option>USD</option>
              <option>GBP</option>
              <option>EUR</option>
              <option>USDT</option>
              <option>USDC</option>
            </select>
          </div>

          {error && (
            <div style={{
              background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)",
              borderRadius: 10, padding: "10px 14px", color: "#ff6b6b",
              fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={() => {
              if (!amount) { setError("Enter amount"); return; }
              setError("");
              setStep("method");
            }}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 10,
              background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)", color: "#000",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
              transition: "all 0.2s", boxShadow: "0 0 20px rgba(56,189,248,0.15)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(56,189,248,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(56,189,248,0.15)"; }}
          >
            Continue
          </button>
        </GlassCard>
      </PageShell>
    );
  }

  // ── STEP 2: Method selection ────────────────────────────────────────────────
  if (step === "method") {
    return (
      <PageShell>
        <div style={{ maxWidth: 820, width: "100%" }}>
          <BackBtn onClick={() => setStep("amount")} />
          <h2 style={{ color: "#fff", marginBottom: 24, fontSize: 22, fontWeight: 800 }}>
            Select Payment Method
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
              <button
                key={key}
                onClick={() => { setPaymentMethod(key); setStep("payment"); }}
                style={{
                  ...glassPanel,
                  borderRadius: 14, padding: 22, cursor: "pointer",
                  transition: "all 0.2s", color: "#fff", textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)";
                  e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 10 }}>{method.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{method.name}</div>
                {key === "escrow" && (
                  <div style={{ marginTop: 6, fontSize: 10, color: "#38bdf8", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Prefer using escrow?
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  // ── STEP 3: Payment details ─────────────────────────────────────────────────
  if (step === "payment") {
    const method = PAYMENT_METHODS[paymentMethod];

    // ── Escrow flow — message-first, brand blue accents ──────────────────────
    if (method.details.type === "escrow") {
      return (
        <PageShell center>
          <GlassCard maxWidth={460}>
            <BackBtn onClick={() => setStep("method")} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <IcoShield size={22} />
              <h2 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 800 }}>
                Escrow Payment
              </h2>
            </div>

            <p style={{ color: "#9fb0c0", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Prefer the security of a third-party escrow platform? We support secure
              payments through either <strong style={{ color: "#fff" }}>Upwork</strong> or{" "}
              <strong style={{ color: "#fff" }}>Fiverr</strong>.
            </p>

            <div style={{ display: "flex", gap: 16, marginBottom: 24, justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <FiverrLogo size={56} />
                <div style={{ fontSize: 12, color: "#ccc", marginTop: 8, fontWeight: 700 }}>Fiverr</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <UpworkLogo size={56} />
                <div style={{ fontSize: 12, color: "#ccc", marginTop: 8, fontWeight: 700 }}>Upwork</div>
              </div>
            </div>

            <div style={{
              background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 12, padding: "16px 18px", marginBottom: 24,
              fontSize: 13, color: "#9dd8f7", lineHeight: 1.6,
            }}>
              These links are set up per-project, so message us in your Project
              Discussion chat and we'll send you a secure Upwork or Fiverr link
              for <strong>{project.service}</strong> right away.
            </div>

            <button
              onClick={() => navigate("/portal", { state: { openChat: true, projectId } })}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 10,
                background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
                color: "#000", fontWeight: 700, fontSize: 14, border: "none",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 0 20px rgba(56,189,248,0.15)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(56,189,248,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(56,189,248,0.15)"; }}
            >
              💬 Message Us for Escrow Link
            </button>
          </GlassCard>
        </PageShell>
      );
    }

    // ── Bank / Crypto flow ────────────────────────────────────────────────────
    return (
      <PageShell>
        <div style={{ maxWidth: 620, width: "100%" }}>
          <BackBtn onClick={() => setStep("method")} />

          <GlassCard maxWidth={620}>
            <h2 style={{ color: "#fff", marginBottom: 20, fontSize: 20, fontWeight: 800 }}>
              Send Payment: {amount} {currency}
            </h2>
            <p style={{ color: "#8899aa", marginBottom: 20, fontSize: 13 }}>
              Invoice: {projectId}
            </p>

            {method.details.type === "crypto" && (
              <div style={{
                background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.35)",
                borderRadius: 12, padding: 20, marginBottom: 24,
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#ff6b6b", marginBottom: 10 }}>
                  ⚠️ CRYPTO PAYMENTS CANNOT BE REFUNDED
                </div>
                <p style={{ color: "#ffb3b3", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  Once you send crypto to an address, it CANNOT be reversed or refunded.
                  If sent to the WRONG address or WRONG network, your money is LOST FOREVER.
                </p>
              </div>
            )}

            <div style={{
              background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: 20, marginBottom: 24,
            }}>
              {method.details.type === "bank" ? (
                <>
                  <DetailRow label="Bank Name" value={method.details.bank} />
                  <DetailRow label="Account Holder" value={method.details.accountHolder} />
                  <DetailRow label="Account Number" value={method.details.accountNumber} />
                  {method.details.accountType && <DetailRow label="Account Type" value={method.details.accountType} />}
                  {method.details.sortCode && <DetailRow label="Sort Code" value={method.details.sortCode} />}
                  {method.details.iban && <DetailRow label="IBAN" value={method.details.iban} />}
                  {method.details.achRouting && <DetailRow label="ACH Routing" value={method.details.achRouting} />}
                  {method.details.wireRouting && <DetailRow label="Wire Routing" value={method.details.wireRouting} />}
                  {method.details.swift && <DetailRow label="SWIFT" value={method.details.swift} />}
                  <DetailRow label="Address" value={method.details.address} />
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#8899aa", marginBottom: 4, fontWeight: 600 }}>Network</div>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{method.details.network}</div>
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 12,
                    marginBottom: 16, fontSize: 12, color: "#fff", fontFamily: "monospace",
                    wordBreak: "break-all", border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    {method.details.wallet}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(method.details.wallet);
                      setCopyFeedback("Copied!");
                      setTimeout(() => setCopyFeedback(""), 1000);
                    }}
                    style={{
                      width: "100%", padding: "10px 0", borderRadius: 10,
                      border: "1px solid rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.08)",
                      color: copyFeedback ? "#4ade80" : "#38bdf8", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { if (!copyFeedback) e.currentTarget.style.background = "rgba(56,189,248,0.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(56,189,248,0.08)"; }}
                  >
                    {copyFeedback || "Copy Address"}
                  </button>
                </>
              )}
            </div>

            {method.details.type === "crypto" && (
              <div style={{
                background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.25)",
                borderRadius: 12, padding: 16, marginBottom: 24,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 10 }}>✅ THIS (Correct)</div>
                <div style={{ fontSize: 12, color: "#9dd8f7", marginBottom: 12, lineHeight: 1.6 }}>
                  ✓ Network: {method.details.network}<br/>
                  ✓ Token: {currency}<br/>
                  ✓ Amount: {amount}<br/>
                  ✓ Address above
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ff6b6b", marginBottom: 10 }}>❌ NOT THIS (Wrong)</div>
                <div style={{ fontSize: 12, color: "#ffb3b3", lineHeight: 1.6 }}>
                  ✗ Different network<br/>
                  ✗ Different token<br/>
                  ✗ Wrong address<br/>
                  ✗ Exchange direct send
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#8899aa", marginBottom: 12, fontWeight: 600 }}>
                Upload Receipt / Transaction Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={!!image}
                style={{
                  display: "block", width: "100%", marginBottom: 12, color: "#ccc",
                  padding: "10px 0", cursor: image ? "not-allowed" : "pointer",
                  opacity: image ? 0.5 : 1,
                }}
              />
              {imagePreview && (
                <div style={{ marginBottom: 12 }}>
                  <img src={imagePreview} alt="Receipt" style={{
                    maxWidth: "100%", maxHeight: 200, borderRadius: 10,
                    marginBottom: 12, border: "1px solid rgba(255,255,255,0.1)",
                  }} />
                  <button
                    onClick={() => { setImage(null); setImagePreview(null); setError(""); }}
                    style={{
                      width: "100%", padding: "8px 0", borderRadius: 10,
                      border: "1px solid rgba(255,68,68,0.25)", background: "rgba(255,68,68,0.06)",
                      color: "#ff6b6b", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,68,68,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,68,68,0.06)"; }}
                  >
                    ❌ Delete Image
                  </button>
                </div>
              )}
              {!image && (
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: 10, padding: 20, textAlign: "center", color: "#8899aa",
                  transition: "all 0.2s", cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#38bdf8"; e.currentTarget.style.background = "rgba(56,189,248,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  Upload receipt image (max 5MB)
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)",
                borderRadius: 10, padding: "10px 14px", color: "#ff6b6b",
                fontSize: 13, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmitPayment}
              disabled={!image || loading}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 10,
                background: image && !loading ? "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)" : "rgba(255,255,255,0.06)",
                color: image && !loading ? "#000" : "#666",
                fontWeight: 700, fontSize: 14, border: "none", cursor: image && !loading ? "pointer" : "not-allowed",
                opacity: image && !loading ? 1 : 0.6,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (image && !loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(56,189,248,0.35)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {loading ? "Submitting…" : "Send Payment"}
            </button>
          </GlassCard>
        </div>
      </PageShell>
    );
  }

  // ── STEP 4: Pending ──────────────────────────────────────────────────────────
  if (step === "pending") {
    return (
      <PageShell center>
        <GlassCard>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>⏳</div>
            <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
              Payment Pending
            </h2>
            <p style={{ color: "#8899aa", marginBottom: 20 }}>
              Your receipt has been submitted. We're verifying your payment.
            </p>
            <p style={{ color: "#6b7f92", fontSize: 12 }}>
              Invoice: {projectId}<br/>
              Amount: {amount} {currency}
            </p>
            <div style={{ marginTop: 20, fontSize: 12, color: "#8899aa" }}>
              Checking payment status…
            </div>
          </div>
        </GlassCard>
      </PageShell>
    );
  }

  // ── STEP 5: Success ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <PageShell center>
        <div style={{
          ...glassPanel,
          borderRadius: 16, padding: 32, maxWidth: 420, width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(74,222,128,0.15)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>✅</div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#4ade80" }}>
            Payment Confirmed!
          </h2>
          <p style={{ color: "#8899aa", marginBottom: 20 }}>
            Your payment of {amount} {currency} has been confirmed.
          </p>
          <p style={{ color: "#6b7f92", fontSize: 12, marginBottom: 20 }}>
            We're working on your project. Check your portal for updates.
          </p>
          <button
            onClick={() => navigate("/portal")}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 10,
              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", color: "#000",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(74,222,128,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Back to Portal
          </button>
        </div>
      </PageShell>
    );
  }
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: "#8899aa", marginBottom: 4, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, wordBreak: "break-all" }}>
        {value}
      </div>
    </div>
  );
}
