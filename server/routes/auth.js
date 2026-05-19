import { Router } from "express";
import crypto from "crypto";
import {
  findAccount, createAccount, hashPassword, updatePasswordHash,
  createSession, createVerifyPending, createResetPending, consumePending,
  checkRateLimit,
} from "../store.js";
import { sendVerificationEmail, sendResetEmail } from "../email.js";

const router = Router();

function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ ok: false, error: "All fields are required." });
    if (password.length < 8) return res.json({ ok: false, error: "Password must be at least 8 characters." });
    if (!checkRateLimit(`signup:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many attempts. Please wait a minute and try again." });
    }
    const existing = findAccount(email);
    if (existing?.verified) return res.json({ ok: false, error: "An account with this email already exists." });

    const code = genCode();
    createVerifyPending({ name, email, passwordHash: hashPassword(password), code });
    await sendVerificationEmail(email, code);
    return res.json({ ok: true, message: "Verification code sent successfully. Check inbox/spam folder." });
  } catch (err) {
    console.error("[signup]", err.message);
    return res.json({ ok: false, error: "Failed to send verification email. Please try again." });
  }
});

// POST /api/auth/verify
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

// POST /api/auth/login
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

// POST /api/auth/forgot
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ ok: false, error: "Email is required." });
    if (!checkRateLimit(`forgot:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many attempts. Please wait a minute." });
    }
    const account = findAccount(email);
    if (!account) return res.json({ ok: false, error: "No operational account found for this email." });

    const code = genCode();
    createResetPending({ email, code });
    await sendResetEmail(email, code);
    return res.json({ ok: true, message: "Reset code sent successfully. Check inbox/spam folder." });
  } catch (err) {
    console.error("[forgot]", err.message);
    return res.json({ ok: false, error: "Failed to send reset email. Please try again." });
  }
});

// POST /api/auth/reset
router.post("/reset", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.json({ ok: false, error: "All fields are required." });
    if (newPassword.length < 8) return res.json({ ok: false, error: "Password must be at least 8 characters." });
    if (!checkRateLimit(`reset:${email.toLowerCase()}`)) {
      return res.json({ ok: false, error: "Too many attempts. Please wait a minute." });
    }
    const entry = consumePending("reset", email, code.trim());
    if (!entry) return res.json({ ok: false, error: "Incorrect or expired code. Please request a new one." });

    updatePasswordHash(email, hashPassword(newPassword));
    return res.json({ ok: true });
  } catch (err) {
    console.error("[reset]", err.message);
    return res.json({ ok: false, error: "Password reset failed." });
  }
});

export default router;
