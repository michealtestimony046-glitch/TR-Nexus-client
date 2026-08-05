import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { signup, verifyEmail, login, forgotPassword, resetPassword, apiBase } from "../auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import LegalModal from "../components/LegalModal.jsx";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const next = params.get("next") || "/portal";

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [code, setCode] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState("tos");

  function openLegal(tab) { setLegalTab(tab); setLegalOpen(true); }
  function switchMode(m) { setMode(m); setError(""); setInfo(""); setDone(false); setCode(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (!res.ok) { setError(res.error); setLoading(false); return; }
        refresh();
        navigate(next, { replace: true });

      } else if (mode === "signup") {
        if (!tosChecked) { setError("You must agree to the Terms of Service and Privacy Policy."); setLoading(false); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return; }
        if (password !== confirmPw) { setError("Passwords do not match."); setLoading(false); return; }
const res = await signup(name, email, password);

if (!res.ok) {
  setError(res.error);
  setLoading(false);
  return;
}

setInfo("We've sent a verification code to your email.");
setMode("verify");
setCode("");

      } else if (mode === "verify") {
        const res = await verifyEmail(email, code);
        if (!res.ok) { setError(res.error); setLoading(false); return; }
        refresh();
        navigate(next, { replace: true });

      } else if (mode === "forgot") {
        const res = await forgotPassword(email);
        if (!res.ok) { setError(res.error); setLoading(false); return; }
        setMode("reset");

      } else if (mode === "reset") {
        if (password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return; }
        if (password !== confirmPw) { setError("Passwords do not match."); setLoading(false); return; }
const res = await resetPassword(email, code, password);
        if (!res.ok) { setError(res.error); setLoading(false); return; }
        setDone(true);
      }
    } catch (err) {
      setError("Connection error — please try again in a moment.");
    }

    setLoading(false);
  }

  const titles = {
    login:  { tag: "// Returning User",   h: "Sign In",          sub: "Access your operational account." },
    signup: { tag: "// New Access",        h: "Create Account",   sub: "Set up your operational access to begin." },
    verify: { tag: "// Verification",      h: "Verify Your Email",sub: "Enter the 6-digit code sent to your email." },
    forgot: { tag: "// Account Recovery",  h: "Forgot Password?", sub: "Enter your registered email to reset your password." },
    reset:  { tag: "// Account Recovery",  h: "Reset Password",   sub: "Choose a new password for your account." },
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
            <li><span className="step-n">1</span><div><strong>Create Account</strong><em>Set up your operational access.</em></div></li>
            <li><span className="step-n">2</span><div><strong>Access Portal</strong><em>View your project dashboard.</em></div></li>
            <li><span className="step-n">3</span><div><strong>Submit Intake</strong><em>Initialize a project with our team.</em></div></li>
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

              {info && (
                <div className="auth-info">{info}</div>
              )}

              {mode === "signup" && (
                <div className="field">
                  <label>Full Name</label>
                  <input type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
              )}

{(mode === "login" ||
  mode === "signup" ||
  mode === "verify" ||
  mode === "forgot" ||
  mode === "reset") && (
                <div className="field">
                  <label>Email</label>
                  <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              )}

              {mode === "verify" && (
                <div className="field">
                  <label>Verification Code</label>
                  <input
                    type="text" required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    inputMode="numeric" maxLength={6}
                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.25em", fontSize: 22, textAlign: "center" }}
                    autoComplete="one-time-code"
                  />
                </div>
              )}

{mode === "reset" && (
  <div className="field">
    <label>Password Reset Code</label>
    <input
      type="text"
      required
      value={code}
      onChange={(e) =>
        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
      }
      placeholder="000000"
      inputMode="numeric"
      maxLength={6}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.25em",
        fontSize: 22,
        textAlign: "center",
      }}
      autoComplete="one-time-code"
    />
  </div>
)}

              {(mode === "login" || mode === "signup" || mode === "reset") && (
                <div className="field">
                  <label>{mode === "reset" ? "New Password" : "Password"}</label>
                  <input type="password" required autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
              )}

              {(mode === "signup" || mode === "reset") && (
                <div className="field">
                  <label>Confirm Password</label>
                  <input type="password" required autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
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
                    <input type="checkbox" checked={tosChecked} onChange={(e) => setTosChecked(e.target.checked)} />
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
                {loading ? "Processing…" : { login: "Sign In", signup: "Create Account", verify: "Verify & Activate", forgot: "Continue", reset: "Reset Password" }[mode]}
              </button>
            </form>
          )}

          {/* ── OAuth (shown on login & signup) ── */}
          {(mode === "login" || mode === "signup") && (
            <div className="auth-oauth">
              <div className="auth-oauth-divider"><span>or continue with</span></div>
              <div className="auth-oauth-btns">
                <a href={`${apiBase}/api/auth/github`} className="auth-oauth-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.338c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.203 22 16.448 22 12.021 22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </a>
                <a href={`${apiBase}/api/auth/google`} className="auth-oauth-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </a>
              </div>
            </div>
          )}

          <div className="auth-switch">
            {mode === "login"  && <span>No account? <button className="auth-text-btn" onClick={() => switchMode("signup")}>Create one →</button></span>}
            {mode === "signup" && <span>Already have access? <button className="auth-text-btn" onClick={() => switchMode("login")}>Sign in →</button></span>}
            {mode === "verify" && <span><button className="auth-text-btn" onClick={() => switchMode("signup")}>← Back to signup</button></span>}
            {(mode === "forgot" || mode === "reset") && <span><button className="auth-text-btn" onClick={() => switchMode("login")}>← Back to sign in</button></span>}
          </div>
        </div>
      </div>

      {legalOpen && (
        <LegalModal tab={legalTab} onClose={() => setLegalOpen(false)} onSwitchTab={setLegalTab} />
      )}
    </section>
  );
}
