import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { signup, verifyEmail, login, forgotPassword, resetPassword } from "../auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import LegalModal from "../components/LegalModal.jsx";

function CodeBox({ code }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <div className="code-box">
      <span className="code-box-value">{code}</span>
      <button className="code-box-copy" onClick={copy} type="button">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const next = params.get("next") || "/intake";

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [code, setCode] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingCode, setPendingCode] = useState(null);
  const [done, setDone] = useState(false);

  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState("tos");

  function openLegal(tab) { setLegalTab(tab); setLegalOpen(true); }

  function switchMode(m) { setMode(m); setError(""); setPendingCode(null); setDone(false); setCode(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const res = login(email, password);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      refresh();
      navigate(next, { replace: true });

    } else if (mode === "signup") {
      if (!tosChecked) { setError("You must agree to the Terms of Service and Privacy Policy to continue."); setLoading(false); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return; }
      if (password !== confirmPw) { setError("Passwords do not match."); setLoading(false); return; }
      const res = signup(name, email, password);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setPendingCode(res.code);
      setMode("verify");

    } else if (mode === "verify") {
      const res = verifyEmail(email, code);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      refresh();
      navigate(next, { replace: true });

    } else if (mode === "forgot") {
      const res = forgotPassword(email);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setPendingCode(res.code);
      setMode("reset");

    } else if (mode === "reset") {
      if (password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return; }
      if (password !== confirmPw) { setError("Passwords do not match."); setLoading(false); return; }
      const res = resetPassword(email, code, password);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setDone(true);
    }

    setLoading(false);
  }

  const titles = {
    login: { tag: "// Returning User", h: "Sign In", sub: "Access your operational account." },
    signup: { tag: "// New Access", h: "Create Account", sub: "Set up your operational access to begin." },
    verify: { tag: "// Verification", h: "Verify Your Email", sub: "Enter the 6-digit code generated for your account." },
    forgot: { tag: "// Account Recovery", h: "Forgot Password?", sub: "Enter your email and we'll generate a reset code." },
    reset: { tag: "// Account Recovery", h: "Reset Password", sub: "Enter the reset code and choose a new password." },
  };
  const t = titles[mode];

  return (
    <section className="auth-page page-pad-top">
      <div className="container auth-wrap">
        <div className="auth-side">
          <div className="section-tag">{t.tag}</div>
          <h2>{t.h}</h2>
          <p className="lead-sm">{t.sub}</p>

          <ul className="step-list">
            <li>
              <span className="step-n">1</span>
              <div><strong>Create Account</strong><em>Set up your operational access.</em></div>
            </li>
            <li>
              <span className="step-n">2</span>
              <div><strong>Verify Email</strong><em>Confirm your identity with a one-time code.</em></div>
            </li>
            <li>
              <span className="step-n">3</span>
              <div><strong>Submit Intake</strong><em>Access the project intake workflow.</em></div>
            </li>
          </ul>
        </div>

        <div className="intake-form auth-form">
          <div className="form-head">
            <h3>{t.h}</h3>
            <div className="modal-svc">// T/R Operational Access</div>
          </div>

          {done ? (
            <div className="auth-done">
              <div className="auth-done-icon">✓</div>
              <h4>Password Reset Successful</h4>
              <p>Your password has been updated. You can now sign in with your new credentials.</p>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => switchMode("login")}>
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="field">
                  <label>Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
              )}

              {(mode === "login" || mode === "signup" || mode === "forgot" || mode === "reset") && (
                <div className="field">
                  <label>Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              )}

              {mode === "verify" && (
                <>
                  {pendingCode && (
                    <div className="notice" style={{ marginBottom: 20, marginTop: 0 }}>
                      <strong>Your Verification Code</strong>
                      <p style={{ margin: "6px 0 10px", fontSize: 13 }}>
                        Copy the code below and enter it in the field. In a live deployment, this would be sent to your email.
                      </p>
                      <CodeBox code={pendingCode} />
                    </div>
                  )}
                  <div className="field">
                    <label>Verification Code</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit code"
                      inputMode="numeric"
                      maxLength={6}
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", fontSize: 20, textAlign: "center" }}
                    />
                  </div>
                </>
              )}

              {mode === "reset" && (
                <>
                  {pendingCode && (
                    <div className="notice" style={{ marginBottom: 20, marginTop: 0 }}>
                      <strong>Your Reset Code</strong>
                      <p style={{ margin: "6px 0 10px", fontSize: 13 }}>
                        Use the code below to reset your password. In a live deployment, this would be sent to your email.
                      </p>
                      <CodeBox code={pendingCode} />
                    </div>
                  )}
                  <div className="field">
                    <label>Reset Code</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit code"
                      inputMode="numeric"
                      maxLength={6}
                      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", fontSize: 20, textAlign: "center" }}
                    />
                  </div>
                </>
              )}

              {(mode === "login" || mode === "signup" || mode === "reset") && (
                <div className="field">
                  <label>{mode === "reset" ? "New Password" : "Password"}</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
              )}

              {(mode === "signup" || mode === "reset") && (
                <div className="field">
                  <label>Confirm Password</label>
                  <input type="password" required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
                </div>
              )}

              {mode === "login" && (
                <div className="auth-forgot-row">
                  <button type="button" className="auth-text-btn" onClick={() => switchMode("forgot")}>Forgot Password?</button>
                </div>
              )}

              {mode === "signup" && (
                <div className="field tos-field">
                  <label className="tos-check-label">
                    <input
                      type="checkbox"
                      checked={tosChecked}
                      onChange={(e) => setTosChecked(e.target.checked)}
                    />
                    <span>
                      I agree to the{" "}
                      <button type="button" className="legal-link" onClick={() => openLegal("tos")}>Terms of Service</button>
                      {" "}and{" "}
                      <button type="button" className="legal-link" onClick={() => openLegal("privacy")}>Privacy Policy</button>
                    </span>
                  </label>
                </div>
              )}

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
                {loading ? "Processing…" : {
                  login: "Sign In",
                  signup: "Create Account",
                  verify: "Verify & Activate",
                  forgot: "Send Reset Code",
                  reset: "Reset Password",
                }[mode]}
              </button>
            </form>
          )}

          <div className="auth-switch">
            {mode === "login" ? (
              <span>No account? <button className="auth-text-btn" onClick={() => switchMode("signup")}>Create one →</button></span>
            ) : mode === "signup" ? (
              <span>Already have access? <button className="auth-text-btn" onClick={() => switchMode("login")}>Sign in →</button></span>
            ) : mode === "verify" ? (
              <span>Wrong email? <button className="auth-text-btn" onClick={() => switchMode("signup")}>← Back to signup</button></span>
            ) : mode === "forgot" || mode === "reset" ? (
              <span><button className="auth-text-btn" onClick={() => switchMode("login")}>← Back to sign in</button></span>
            ) : null}
          </div>
        </div>
      </div>

      {legalOpen && (
        <LegalModal
          tab={legalTab}
          onClose={() => setLegalOpen(false)}
          onSwitchTab={setLegalTab}
        />
      )}
    </section>
  );
}
