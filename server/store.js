import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const PENDING_FILE = path.join(DATA_DIR, "pending.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ── Password hashing ──────────────────────────────────────────────────────────
const SALT = "tr_agency_ops_2026_salt";
export function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw + SALT).digest("hex");
}

// ── Accounts ──────────────────────────────────────────────────────────────────
export function getAccounts() { return readJSON(ACCOUNTS_FILE, []); }
function saveAccounts(a) { writeJSON(ACCOUNTS_FILE, a); }

export function findAccount(email) {
  return getAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
}
export function createAccount({ name, email, passwordHash }) {
  const accounts = getAccounts();
  accounts.push({ name, email, passwordHash, verified: true, createdAt: new Date().toISOString(), sessions: [] });
  saveAccounts(accounts);
}
export function updatePasswordHash(email, passwordHash) {
  const accounts = getAccounts();
  const i = accounts.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
  if (i !== -1) { accounts[i].passwordHash = passwordHash; saveAccounts(accounts); }
}

// ── Sessions ──────────────────────────────────────────────────────────────────
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

export function createSession(email) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL;
  const accounts = getAccounts();
  const i = accounts.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
  if (i !== -1) {
    if (!accounts[i].sessions) accounts[i].sessions = [];
    // Keep only last 5 sessions
    accounts[i].sessions = accounts[i].sessions.filter((s) => s.expiresAt > Date.now()).slice(-4);
    accounts[i].sessions.push({ token, expiresAt });
    saveAccounts(accounts);
  }
  return { token, expiresAt };
}
export function validateSession(token) {
  if (!token) return null;
  const accounts = getAccounts();
  for (const account of accounts) {
    const session = (account.sessions || []).find((s) => s.token === token && s.expiresAt > Date.now());
    if (session) return { name: account.name, email: account.email };
  }
  return null;
}

// ── Pending codes (verify + reset) ────────────────────────────────────────────
export function getPending() { return readJSON(PENDING_FILE, []); }
function savePending(p) { writeJSON(PENDING_FILE, p); }

function cleanPending() {
  savePending(getPending().filter((p) => p.expiresAt > Date.now()));
}

export function createVerifyPending({ name, email, passwordHash, code, ttl = 10 * 60 * 1000 }) {
  cleanPending();
  const pending = getPending().filter((p) => !(p.type === "verify" && p.email.toLowerCase() === email.toLowerCase()));
  pending.push({ type: "verify", name, email, passwordHash, code, expiresAt: Date.now() + ttl, used: false });
  savePending(pending);
}
export function createResetPending({ email, code, ttl = 15 * 60 * 1000 }) {
  cleanPending();
  const pending = getPending().filter((p) => !(p.type === "reset" && p.email.toLowerCase() === email.toLowerCase()));
  pending.push({ type: "reset", email, code, expiresAt: Date.now() + ttl, used: false });
  savePending(pending);
}
export function consumePending(type, email, code) {
  cleanPending();
  const pending = getPending();
  const idx = pending.findIndex(
    (p) => p.type === type && p.email.toLowerCase() === email.toLowerCase() && p.code === code && !p.used
  );
  if (idx === -1) return null;
  const entry = pending[idx];
  pending.splice(idx, 1); // single-use: remove immediately
  savePending(pending);
  return entry;
}

// ── Rate limiting (in-memory) ─────────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW = 60 * 1000; // 1 minute
const RATE_MAX = 3;

export function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + RATE_WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_WINDOW; }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= RATE_MAX;
}

// ── Projects ──────────────────────────────────────────────────────────────────
export function getProjects() { return readJSON(PROJECTS_FILE, []); }
function saveProjects(p) { writeJSON(PROJECTS_FILE, p); }

export function getProjectsByEmail(email) {
  return getProjects()
    .filter((p) => p.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function createProject(project) {
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
  return project;
}

export function genProjectId() {
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `TR-2026-${num}`;
}
