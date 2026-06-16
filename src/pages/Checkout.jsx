import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession } from "../auth.js";

const PAYMENT_METHODS = {
  "lead-bank": {
    name: "Lead Bank (USD)",
    currency: "USD",
    icon: "💵",
    details: {
      bank: "Lead Bank",
      accountHolder: "omolara temidayo yusuf",
      accountNumber: "2121117288832",
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

  // Fetch project info
  useEffect(() => {
    if (!session || !projectId) {
      navigate("/login");
      return;
    }

    fetchProjectInfo();
  }, [session, projectId]);

  // Poll for payment confirmation every 5 seconds
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
  if (!project) return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;

  // STEP 1: Amount Input
  if (step === "amount") {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg, #0a0a0a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20
      }}>
        <div style={{
          background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
          borderRadius: 12, padding: 40, maxWidth: 400, width: "100%"
        }}>
          <button
            onClick={() => navigate("/portal")}
            style={{
              background: "none", border: "none", color: "var(--accent, #38bdf8)",
              cursor: "pointer", fontSize: 14, marginBottom: 20, fontWeight: 600,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            ← Back to Portal
          </button>

          <div style={{ fontSize: 11, color: "var(--accent, #38bdf8)", letterSpacing: "0.1em", marginBottom: 8 }}>
            // CHECKOUT
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
            Complete Payment
          </h2>
          <p style={{ margin: "0 0 24px", color: "var(--muted, #666)", fontSize: 14 }}>
            {project.service}
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted, #666)", marginBottom: 6, fontWeight: 600 }}>
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "var(--bg, #0a0a0a)", border: "1px solid var(--border, #222)",
                borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14,
                marginBottom: 10, transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.background = "#38bdf805";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border, #222)";
                e.currentTarget.style.background = "var(--bg, #0a0a0a)";
              }}
            />
            <label style={{ display: "block", fontSize: 12, color: "var(--muted, #666)", marginBottom: 6, fontWeight: 600 }}>
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "var(--bg, #0a0a0a)", border: "1px solid var(--border, #222)",
                borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14,
                transition: "all 0.2s", cursor: "pointer"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#38bdf8";
                e.currentTarget.style.background = "#38bdf805";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border, #222)";
                e.currentTarget.style.background = "var(--bg, #0a0a0a)";
              }}
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
              background: "#ff444411", border: "1px solid #ff444433",
              borderRadius: 8, padding: "10px 14px", color: "#ff6b6b",
              fontSize: 13, marginBottom: 16
            }}>
              {error}
            </div>
          )}

          <button
            onClick={() => {
              if (!amount) {
                setError("Enter amount");
                return;
              }
              setError("");
              setStep("method");
            }}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 8,
              background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)", color: "#000",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px #38bdf844";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: Payment Method Selection
  if (step === "method") {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg, #0a0a0a)",
        padding: "24px 16px"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <button
            onClick={() => setStep("amount")}
            style={{
              background: "none", border: "none", color: "var(--accent, #38bdf8)",
              cursor: "pointer", fontSize: 14, marginBottom: 20, fontWeight: 600,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            ← Back
          </button>

          <h2 style={{ color: "#fff", marginBottom: 24 }}>Select Payment Method</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
              <button
                key={key}
                onClick={() => {
                  setPaymentMethod(key);
                  setStep("payment");
                }}
                style={{
                  background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
                  borderRadius: 12, padding: 20, cursor: "pointer",
                  transition: "all 0.2s",
                  color: "#fff"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#38bdf8";
                  e.currentTarget.style.background = "#38bdf811";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border, #222)";
                  e.currentTarget.style.background = "var(--surface, #111)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{method.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{method.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Payment Details
  if (step === "payment") {
    const method = PAYMENT_METHODS[paymentMethod];

    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg, #0a0a0a)",
        padding: "24px 16px"
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button
            onClick={() => setStep("method")}
            style={{
              background: "none", border: "none", color: "var(--accent, #38bdf8)",
              cursor: "pointer", fontSize: 14, marginBottom: 20, fontWeight: 600,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            ← Back
          </button>

          <div style={{
            background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
            borderRadius: 12, padding: 28
          }}>
            <h2 style={{ color: "#fff", marginBottom: 20 }}>
              Send Payment: {amount} {currency}
            </h2>

            <p style={{ color: "var(--muted, #666)", marginBottom: 20 }}>
              Invoice: {projectId}
            </p>

            {/* CRYPTO WARNING */}
            {method.details.type === "crypto" && (
              <div style={{
                background: "#ff444411", border: "2px solid #ff4444",
                borderRadius: 12, padding: 20, marginBottom: 24
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#ff6b6b", marginBottom: 12 }}>
                  ⚠️ CRYPTO PAYMENTS CANNOT BE REFUNDED
                </div>
                <p style={{ color: "#ff9999", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  Once you send crypto to an address, it CANNOT be reversed or refunded.
                  If sent to the WRONG address or WRONG network, your money is LOST FOREVER.
                </p>
              </div>
            )}

            {/* PAYMENT DETAILS */}
            <div style={{
              background: "var(--bg, #0a0a0a)", borderRadius: 12, padding: 20,
              marginBottom: 24
            }}>
              {method.details.type === "bank" ? (
                <>
                  <DetailRow label="Bank Name" value={method.details.bank} />
                  <DetailRow label="Account Holder" value={method.details.accountHolder} />
                  <DetailRow label="Account Number" value={method.details.accountNumber} />
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
                    <div style={{ fontSize: 11, color: "var(--muted, #666)", marginBottom: 4, fontWeight: 600 }}>
                      Network
                    </div>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
                      {method.details.network}
                    </div>
                  </div>
                  <div style={{
                    background: "#fff1", borderRadius: 8, padding: 12,
                    marginBottom: 16, fontSize: 12, color: "#fff", fontFamily: "monospace",
                    wordBreak: "break-all"
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
                      width: "100%", padding: "10px 0", borderRadius: 8,
                      border: "1px solid #38bdf844", background: "#38bdf811",
                      color: copyFeedback ? "#4ade80" : "#38bdf8", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (!copyFeedback) {
                        e.currentTarget.style.background = "#38bdf822";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#38bdf811";
                    }}
                  >
                    {copyFeedback || "Copy Address"}
                  </button>
                </>
              )}
            </div>

            {/* CRYPTO CHECKLIST */}
            {method.details.type === "crypto" && (
              <div style={{
                background: "#38bdf411", border: "1px solid #38bdf844",
                borderRadius: 12, padding: 16, marginBottom: 24
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 12 }}>
                  ✅ THIS (Correct)
                </div>
                <div style={{ fontSize: 12, color: "#38bdf8", marginBottom: 12, lineHeight: 1.6 }}>
                  ✓ Network: {method.details.network}<br/>
                  ✓ Token: {currency}<br/>
                  ✓ Amount: {amount}<br/>
                  ✓ Address above
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ff6b6b", marginBottom: 12 }}>
                  ❌ NOT THIS (Wrong)
                </div>
                <div style={{ fontSize: 12, color: "#ff6b6b", lineHeight: 1.6 }}>
                  ✗ Different network<br/>
                  ✗ Different token<br/>
                  ✗ Wrong address<br/>
                  ✗ Exchange direct send
                </div>
              </div>
            )}

            {/* IMAGE UPLOAD */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 12, color: "var(--muted, #666)",
                marginBottom: 12, fontWeight: 600
              }}>
                Upload Receipt / Transaction Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={image ? true : false}
                style={{
                  display: "block", width: "100%", marginBottom: 12,
                  padding: "10px 0", cursor: image ? "not-allowed" : "pointer",
                  opacity: image ? 0.5 : 1
                }}
              />
              {imagePreview && (
                <div style={{ marginBottom: 12 }}>
                  <img src={imagePreview} alt="Receipt" style={{
                    maxWidth: "100%", maxHeight: 200, borderRadius: 8,
                    marginBottom: 12, border: "1px solid var(--border, #222)"
                  }} />
                  <button
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                      setError("");
                    }}
                    style={{
                      width: "100%", padding: "8px 0", borderRadius: 8,
                      border: "1px solid #ff444433", background: "#ff444408",
                      color: "#ff6b6b", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ff444411";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ff444408";
                    }}
                  >
                    ❌ Delete Image
                  </button>
                </div>
              )}
              {!image && (
                <div style={{
                  background: "var(--bg, #0a0a0a)", border: "1px dashed var(--border, #222)",
                  borderRadius: 8, padding: 20, textAlign: "center", color: "var(--muted, #666)",
                  transition: "all 0.2s", cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#38bdf8";
                  e.currentTarget.style.background = "#38bdf805";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border, #222)";
                  e.currentTarget.style.background = "var(--bg, #0a0a0a)";
                }}
                >
                  Upload receipt image (max 5MB)
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: "#ff444411", border: "1px solid #ff444433",
                borderRadius: 8, padding: "10px 14px", color: "#ff6b6b",
                fontSize: 13, marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmitPayment}
              disabled={!image || loading}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8,
                background: image && !loading ? "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)" : "var(--border, #222)",
                color: image && !loading ? "#000" : "#666",
                fontWeight: 700, fontSize: 14, border: "none", cursor: image && !loading ? "pointer" : "not-allowed",
                opacity: image && !loading ? 1 : 0.5,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (image && !loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px #38bdf844";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {loading ? "Submitting…" : "Send Payment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: Pending Approval
  if (step === "pending") {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg, #0a0a0a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20
      }}>
        <div style={{
          background: "var(--surface, #111)", border: "1px solid var(--border, #222)",
          borderRadius: 12, padding: 40, maxWidth: 400, width: "100%",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>⏳</div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
            Payment Pending
          </h2>
          <p style={{ color: "var(--muted, #666)", marginBottom: 20 }}>
            Your receipt has been submitted. We're verifying your payment.
          </p>
          <p style={{ color: "var(--muted, #888)", fontSize: 12 }}>
            Invoice: {projectId}<br/>
            Amount: {amount} {currency}
          </p>
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--muted, #666)" }}>
            Checking payment status...
          </div>
        </div>
      </div>
    );
  }

  // STEP 5: Success
  if (step === "success") {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg, #0a0a0a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20
      }}>
        <div style={{
          background: "var(--surface, #111)", border: "1px solid #4ade8033",
          borderRadius: 12, padding: 40, maxWidth: 400, width: "100%",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>✅</div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#4ade80" }}>
            Payment Confirmed!
          </h2>
          <p style={{ color: "var(--muted, #666)", marginBottom: 20 }}>
            Your payment of {amount} {currency} has been confirmed.
          </p>
          <p style={{ color: "var(--muted, #888)", fontSize: 12, marginBottom: 20 }}>
            We're working on your project. Check your portal for updates.
          </p>
          <button
            onClick={() => navigate("/portal")}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 8,
              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", color: "#000",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px #4ade8044";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: "var(--muted, #666)", marginBottom: 4, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, wordBreak: "break-all" }}>
        {value}
      </div>
    </div>
  );
}