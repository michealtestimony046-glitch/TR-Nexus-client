import { Router } from "express";
import crypto from "crypto";
import {
  findAccount, createAccount, hashPassword, updatePasswordHash,
  createSession, createVerifyPending, createResetPending, consumePending,
  checkRateLimit,
} from "../store.js";
import { sendVerificationEmail, sendResetEmail } from "../email.js";
import passportInstance from "../passport.js";

const router = Router();

// On split deploy (Render + Vercel) set FRONTEND_URL to the Vercel origin.
// On same-origin deploy (Replit / Render serving frontend) leave it unset — 
// relative paths like /login or /auth/callback will resolve correctly.
const FRONTEND_URL = process.env.FRONTEND_URL || "";

function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ ok: false, error: "All fields are required." });
    if (password.length < 8) return res.json({ ok: false, error: "Password must be at least 8 characters." });
    if (!checkRateLimit(`signup:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many attempts. Please wait a minute and try again." });
    }
    const existing = findAccount(email);
    if (existing) return res.json({ ok: false, error: "An account with this email already exists." });

    createAccount({ name, email, passwordHash: hashPassword(password) });
    const { token, expiresAt } = createSession(email);
    return res.json({ ok: true, session: { name, email, token, expiresAt } });
  } catch (err) {
    console.error("[signup]", err.message);
    return res.json({ ok: false, error: "Signup failed. Please try again." });
  }
});

// ── POST /api/auth/verify ─────────────────────────────────────────────────────
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.json({ ok: false, error: "Email and code are required." });
    if (!checkRateLimit(`verify:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many attempts. Please wait a minute." });
    }
    const entry = consumePending("verify", email, code.trim());
    if (!entry) return res.json({ ok: false, error: "Incorrect or expired code. Please try again." });

    createAccount({ name: entry.name, email: entry.email, passwordHash: entry.passwordHash });
    const { token, expiresAt } = createSession(entry.email);
    return res.json({ ok: true, session: { name: entry.name, email: entry.email, token, expiresAt } });
  } catch (err) {
    console.error("[verify]", err.message);
    return res.json({ ok: false, error: "Verification failed." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ ok: false, error: "Email and password are required." });
    if (!checkRateLimit(`login:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many login attempts. Please wait a minute." });
    }
    const account = findAccount(email);
    if (!account) return res.json({ ok: false, error: "No operational account found for this email." });
    if (!account.verified) return res.json({ ok: false, error: "Account not verified. Please complete email verification." });
    if (account.passwordHash !== hashPassword(password)) return res.json({ ok: false, error: "Incorrect password." });

    const { token, expiresAt } = createSession(account.email);
    return res.json({ ok: true, session: { name: account.name, email: account.email, token, expiresAt } });
  } catch (err) {
    console.error("[login]", err.message);
    return res.json({ ok: false, error: "Login failed." });
  }
});

// ── POST /api/auth/forgot ─────────────────────────────────────────────────────
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ ok: false, error: "Email is required." });
    if (!checkRateLimit(`forgot:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many attempts. Please wait a minute." });
    }
    const account = findAccount(email);
    if (!account) return res.json({ ok: false, error: "No operational account found for this email." });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[forgot]", err.message);
    return res.json({ ok: false, error: "Something went wrong. Please try again." });
  }
});

// ── POST /api/auth/reset ──────────────────────────────────────────────────────
router.post("/reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.json({ ok: false, error: "All fields are required." });
    if (newPassword.length < 8) return res.json({ ok: false, error: "Password must be at least 8 characters." });
    if (!checkRateLimit(`reset:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many attempts. Please wait a minute." });
    }
    const account = findAccount(email);
    if (!account) return res.json({ ok: false, error: "No account found for this email." });
    updatePasswordHash(email, hashPassword(newPassword));
    return res.json({ ok: true });
  } catch (err) {
    console.error("[reset]", err.message);
    return res.json({ ok: false, error: "Password reset failed." });
  }
});

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
router.get(
  "/github",
  (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID) {
      return res.redirect(`${FRONTEND_URL}/login?error=GitHub+OAuth+not+configured`);
    }
    next();
  },
  passportInstance.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passportInstance.authenticate("github", {
    failureRedirect: `${FRONTEND_URL}/login?error=github_oauth_failed`,
  }),
  (req, res) => {
    try {
      const { token, expiresAt } = createSession(req.user.email);
      const params = new URLSearchParams({
        token,
        name: req.user.name,
        email: req.user.email,
        expiresAt: String(expiresAt),
      });
      res.redirect(`${FRONTEND_URL}/auth/callback?${params}`);
    } catch (err) {
      console.error("[github/callback]", err.message);
      res.redirect(`${FRONTEND_URL}/login?error=session_failed`);
    }
  }
);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get(
  "/google",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.redirect(`${FRONTEND_URL}/login?error=Google+OAuth+not+configured`);
    }
    next();
  },
  passportInstance.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passportInstance.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=google_oauth_failed`,
  }),
  (req, res) => {
    try {
      const { token, expiresAt } = createSession(req.user.email);
      const params = new URLSearchParams({
        token,
        name: req.user.name,
        email: req.user.email,
        expiresAt: String(expiresAt),
      });
      res.redirect(`${FRONTEND_URL}/auth/callback?${params}`);
    } catch (err) {
      console.error("[google/callback]", err.message);
      res.redirect(`${FRONTEND_URL}/login?error=session_failed`);
    }
  }
);

export default router;
