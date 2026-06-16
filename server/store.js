import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const PENDING_FILE  = path.join(DATA_DIR, "pending.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

// ── Ensure data directory exists ──────────────────────────────────────────────
fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Safe JSON read/write with backup ─────────────────────────────────────────
function readJSON(file, fallback) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    if (!raw || raw.trim() === "") return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[store] readJSON error (${path.basename(file)}):`, err.message);
    // Try backup file if main is corrupted
    const backup = file + ".bak";
    try {
      const raw2 = fs.readFileSync(backup, "utf8");
      console.warn(`[store] Recovering from backup: ${backup}`);
      return JSON.parse(raw2);
    } catch {
      return fallback;
    }
  }
}

function writeJSON(file, data) {
  try {
    const json = JSON.stringify(data, null, 2);

    // Write to temp file first, then rename (atomic write — prevents corruption)
    const tmp = file + ".tmp";
    fs.writeFileSync(tmp, json, "utf8");

    // Keep a rolling backup
    try {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, file + ".bak");
      }
    } catch { /* backup failed, not critical */ }

    fs.renameSync(tmp, file);
  } catch (err) {
    console.error(`[store] writeJSON error (${path.basename(file)}):`, err.message);
    throw err;
  }
}

// ── Image compression helper ──────────────────────────────────────────────────
// Strips image data from stored messages/projects older than 7 days to save space
function stripOldImages(projects) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return projects.map(p => {
    if (!p.messages) return p;
    return {
      ...p,
      messages: p.messages.map(m => {
        if (
          (m.type === "image" || m.type === "voice" || m.type === "audio") &&
          m.content?.startsWith("data:") &&
          new Date(m.timestamp).getTime() < cutoff
        ) {
          return { ...m, content: "[media expired]", expired: true };
        }
        return m;
      }),
    };
  });
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
  return getAccounts().find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  ) || null;
}

export function createAccount({ name, email, passwordHash }) {
  const accounts = getAccounts();
  // Prevent duplicate accounts
  if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Account already exists.");
  }
  accounts.push({
    name,
    email,
    passwordHash,
    verified: true,
    createdAt: new Date().toISOString(),
    sessions: [],
  });
  saveAccounts(accounts);
}

export function updatePasswordHash(email, passwordHash) {
  const accounts = getAccounts();
  const i = accounts.findIndex(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
  if (i !== -1) {
    accounts[i].passwordHash = passwordHash;
    accounts[i].updatedAt = new Date().toISOString();
    saveAccounts(accounts);
  }
}

// ── Sessions ──────────────────────────────────────────────────────────────────
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days (was 7)

export function createSession(email) {
  const token     = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL;
  const accounts  = getAccounts();
  const i = accounts.findIndex(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
  if (i !== -1) {
    if (!accounts[i].sessions) accounts[i].sessions = [];
    // Keep last 5 active sessions, remove expired ones
    accounts[i].sessions = accounts[i].sessions
      .filter((s) => s.expiresAt > Date.now())
      .slice(-5);
    accounts[i].sessions.push({ token, expiresAt });
    saveAccounts(accounts);
  }
  return { token, expiresAt };
}

export function validateSession(token) {
  if (!token) return null;
  const accounts = getAccounts();
  for (const account of accounts) {
    const session = (account.sessions || []).find(
      (s) => s.token === token && s.expiresAt > Date.now()
    );
    if (session) return { name: account.name, email: account.email };
  }
  return null;
}

export function revokeSession(token) {
  const accounts = getAccounts();
  let changed = false;
  for (const account of accounts) {
    const before = account.sessions?.length || 0;
    account.sessions = (account.sessions || []).filter(s => s.token !== token);
    if (account.sessions.length !== before) changed = true;
  }
  if (changed) saveAccounts(accounts);
}

// ── Pending codes (verify + reset) ────────────────────────────────────────────
export function getPending() { return readJSON(PENDING_FILE, []); }
function savePending(p) { writeJSON(PENDING_FILE, p); }

function cleanPending() {
  savePending(getPending().filter((p) => p.expiresAt > Date.now()));
}

export function createVerifyPending({ name, email, passwordHash, code, ttl = 10 * 60 * 1000 }) {
  cleanPending();
  const pending = getPending().filter(
    (p) => !(p.type === "verify" && p.email.toLowerCase() === email.toLowerCase())
  );
  pending.push({
    type: "verify", name, email, passwordHash, code,
    expiresAt: Date.now() + ttl, used: false,
  });
  savePending(pending);
}

export function createResetPending({ email, code, ttl = 15 * 60 * 1000 }) {
  cleanPending();
  const pending = getPending().filter(
    (p) => !(p.type === "reset" && p.email.toLowerCase() === email.toLowerCase())
  );
  pending.push({
    type: "reset", email, code,
    expiresAt: Date.now() + ttl, used: false,
  });
  savePending(pending);
}

export function consumePending(type, email, code) {
  cleanPending();
  const pending = getPending();
  const idx = pending.findIndex(
    (p) =>
      p.type === type &&
      p.email.toLowerCase() === email.toLowerCase() &&
      p.code === code &&
      !p.used
  );
  if (idx === -1) return null;
  const entry = pending[idx];
  pending.splice(idx, 1);
  savePending(pending);
  return entry;
}

// ── Rate limiting (in-memory) ─────────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW  = 60 * 1000;
const RATE_MAX     = 5; // bumped from 3 to 5

export function checkRateLimit(key) {
  const now   = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + RATE_WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_WINDOW; }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= RATE_MAX;
}

// ── Projects ──────────────────────────────────────────────────────────────────
export function getProjects() {
  return readJSON(PROJECTS_FILE, []);
}

function saveProjects(projects) {
  writeJSON(PROJECTS_FILE, projects);
}

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

export function getAllProjects() {
  return getProjects()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function updateProjectStatus(id, status) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  projects[i].status    = status;
  projects[i].updatedAt = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

// ── Get single project ────────────────────────────────────────────────────────
export function getProjectById(id) {
  return getProjects().find((p) => p.id === id) || null;
}

// ── Payments ──────────────────────────────────────────────────────────────────
export function savePaymentRequest(id, payment) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  projects[i].payment = {
    ...payment,
    status:       "pending",
    requested_at: payment.requested_at || new Date().toISOString(),
  };
  projects[i].updatedAt = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

export function confirmPayment(id) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  if (!projects[i].payment) projects[i].payment = {};
  projects[i].payment.status       = "paid";
  projects[i].payment.confirmed_at = new Date().toISOString();
  projects[i].updatedAt            = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

export function rejectPayment(id) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  if (!projects[i].payment) projects[i].payment = {};
  projects[i].payment.status      = "rejected";
  projects[i].payment.rejected_at = new Date().toISOString();
  projects[i].updatedAt           = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

// ── Feedback ──────────────────────────────────────────────────────────────────
export function saveFeedback(id, feedback) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  projects[i].feedback = {
    ...feedback,
    submitted_at: feedback.submitted_at || new Date().toISOString(),
  };
  projects[i].updatedAt = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

// ── Chat Messages ─────────────────────────────────────────────────────────────
export function saveMessage(id, message) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  if (!projects[i].messages) projects[i].messages = [];
  projects[i].messages.push(message);
  projects[i].updatedAt = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

export function getMessages(id) {
  const projects = getProjects();
  const project  = projects.find((p) => p.id === id);
  if (!project) return [];
  return project.messages || [];
}

export function markMessageRead(id, msgId) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  if (!projects[i].messages) return null;
  const mi = projects[i].messages.findIndex((m) => m.id === msgId);
  if (mi === -1) return null;
  projects[i].messages[mi].read = true;
  projects[i].updatedAt         = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

// ── Mark ALL messages in a project as read ────────────────────────────────────
export function markAllMessagesRead(id) {
  const projects = getProjects();
  const i = projects.findIndex((p) => p.id === id);
  if (i === -1) return null;
  if (!projects[i].messages) return projects[i];
  projects[i].messages = projects[i].messages.map(m => ({ ...m, read: true }));
  projects[i].updatedAt = new Date().toISOString();
  saveProjects(projects);
  return projects[i];
}

// ── Analytics helpers ─────────────────────────────────────────────────────────
export function getStats() {
  const projects = getProjects();
  const accounts = getAccounts();
  return {
    totalProjects:   projects.length,
    totalClients:    accounts.length,
    byStatus: {
      active:               projects.filter(p => p.status === "active").length,
      "in-analysis":        projects.filter(p => p.status === "in-analysis").length,
      "pending-delivery":   projects.filter(p => p.status === "pending-delivery").length,
      completed:            projects.filter(p => p.status === "completed").length,
      cancelled:            projects.filter(p => p.status === "cancelled").length,
    },
    pendingPayments: projects.filter(p => p.payment?.status === "pending").length,
    confirmedPayments: projects.filter(p => p.payment?.status === "paid").length,
    totalRevenue: projects
      .filter(p => p.payment?.status === "paid")
      .reduce((sum, p) => sum + (parseFloat(p.payment?.amount) || 0), 0),
    avgRating: (() => {
      const rated = projects.filter(p => p.feedback?.rating);
      if (!rated.length) return null;
      return (rated.reduce((s, p) => s + p.feedback.rating, 0) / rated.length).toFixed(1);
    })(),
  };
}
