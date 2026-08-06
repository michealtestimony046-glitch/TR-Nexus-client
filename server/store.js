import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ── Password hashing ──────────────────────────────────────────────────────────
const SALT = "tr_agency_ops_2026_salt";
export function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw + SALT).digest("hex");
}

// ── Accounts ──────────────────────────────────────────────────────────────────
export async function getAccounts() {
  const { data, error } = await supabase.from("accounts").select("*");
  if (error) { console.error("[store] getAccounts:", error.message); return []; }
  return data;
}

export async function findAccount(email) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  if (error) { console.error("[store] findAccount:", error.message); return null; }
  return data;
}

export async function createAccount({ name, email, passwordHash }) {
  const existing = await findAccount(email);
  if (existing) throw new Error("Account already exists.");

  const { error } = await supabase.from("accounts").insert({
    name,
    email,
    password_hash: passwordHash,
    verified: true,
  });
  if (error) throw new Error(error.message);
}

export async function updatePasswordHash(email, passwordHash) {
  const { error } = await supabase
    .from("accounts")
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .ilike("email", email);
  if (error) console.error("[store] updatePasswordHash:", error.message);
}

// ── Sessions ──────────────────────────────────────────────────────────────────
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(email) {
  const account = await findAccount(email);
  if (!account) throw new Error(`Account not found: ${email}`);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL;

  const { data, error } = await supabase.from("sessions").insert({
    token,
    email: account.email,
    expires_at: expiresAt,
  }).select();

  console.log("[createSession] insert result:", { data, error, token, expiresAt });

  if (error) throw new Error(error.message);

  return { token, expiresAt };
}

export async function validateSession(token) {
  if (!token) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select("*, accounts(name, email)")
    .eq("token", token)
    .gt("expires_at", Date.now())
    .maybeSingle();

  if (error || !data) return null;
  return { name: data.accounts.name, email: data.accounts.email };
}

export async function revokeSession(token) {
  const { error } = await supabase.from("sessions").delete().eq("token", token);
  if (error) console.error("[store] revokeSession:", error.message);
}

// ── Pending codes (verify + reset) ────────────────────────────────────────────
async function cleanPending() {
  await supabase.from("pending").delete().lt("expires_at", Date.now());
}

export async function createVerifyPending({ name, email, passwordHash, code, ttl = 10 * 60 * 1000 }) {
  await cleanPending();
  await supabase.from("pending").delete().eq("type", "verify").ilike("email", email);
  const { error } = await supabase.from("pending").insert({
    type: "verify", name, email, password_hash: passwordHash, code,
    expires_at: Date.now() + ttl, used: false,
  });
  if (error) console.error("[store] createVerifyPending:", error.message);
}

export async function createResetPending({ email, code, ttl = 15 * 60 * 1000 }) {
  await cleanPending();
  await supabase.from("pending").delete().eq("type", "reset").ilike("email", email);
  const { error } = await supabase.from("pending").insert({
    type: "reset", email, code,
    expires_at: Date.now() + ttl, used: false,
  });
  if (error) console.error("[store] createResetPending:", error.message);
}

export async function consumePending(type, email, code) {
  await cleanPending();
  const { data, error } = await supabase
    .from("pending")
    .select("*")
    .eq("type", type)
    .ilike("email", email)
    .eq("code", code)
    .eq("used", false)
    .maybeSingle();

  if (error || !data) return null;

  await supabase.from("pending").delete().eq("id", data.id);

  return {
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
  };
}

// ── Rate limiting (in-memory — fine to keep as-is, doesn't need persistence) ──
const rateLimitMap = new Map();
const RATE_WINDOW  = 60 * 1000;
const RATE_MAX     = 5;

export function checkRateLimit(key) {
  const now   = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + RATE_WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_WINDOW; }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= RATE_MAX;
}

// ── Projects ──────────────────────────────────────────────────────────────────
export async function getProjects() {
  const { data, error } = await supabase.from("projects").select("*");
  if (error) { console.error("[store] getProjects:", error.message); return []; }
  return data;
}

export async function getProjectsByEmail(email) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .ilike("email", email)
    .order("submitted_at", { ascending: false });
  if (error) { console.error("[store] getProjectsByEmail:", error.message); return []; }
  return data;
}

export async function createProject(project) {
  const { error } = await supabase.from("projects").insert({
    id: project.id,
    email: project.email,
    service: project.service,
    status: project.status || "active",
    submitted_at: project.submittedAt || new Date().toISOString(),
    messages: project.messages || [],
  });
  if (error) throw new Error(error.message);
  return project;
}

export function genProjectId() {
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `TR-2026-${num}`;
}

export async function getAllProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) { console.error("[store] getAllProjects:", error.message); return []; }
  return data;
}

export async function updateProjectStatus(id, status) {
  const { data, error } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] updateProjectStatus:", error.message); return null; }
  return data;
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("[store] getProjectById:", error.message); return null; }
  return data;
}

// ── Payments ──────────────────────────────────────────────────────────────────
export async function savePaymentRequest(id, payment) {
  const { data, error } = await supabase
    .from("projects")
    .update({
      payment: { ...payment, status: "pending", requested_at: payment.requested_at || new Date().toISOString() },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] savePaymentRequest:", error.message); return null; }
  return data;
}

export async function confirmPayment(id) {
  const project = await getProjectById(id);
  if (!project) return null;
  const payment = { ...(project.payment || {}), status: "paid", confirmed_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("projects")
    .update({ payment, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] confirmPayment:", error.message); return null; }
  return data;
}

export async function rejectPayment(id) {
  const project = await getProjectById(id);
  if (!project) return null;
  const payment = { ...(project.payment || {}), status: "rejected", rejected_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("projects")
    .update({ payment, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] rejectPayment:", error.message); return null; }
  return data;
}

// ── Feedback ──────────────────────────────────────────────────────────────────
export async function saveFeedback(id, feedback) {
  const { data, error } = await supabase
    .from("projects")
    .update({
      feedback: { ...feedback, submitted_at: feedback.submitted_at || new Date().toISOString() },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] saveFeedback:", error.message); return null; }
  return data;
}

// ── Chat Messages ─────────────────────────────────────────────────────────────
export async function saveMessage(id, message) {
  const project = await getProjectById(id);
  if (!project) return null;
  const messages = [...(project.messages || []), message];
  const { data, error } = await supabase
    .from("projects")
    .update({ messages, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] saveMessage:", error.message); return null; }
  return data;
}

export async function getMessages(id) {
  const project = await getProjectById(id);
  return project?.messages || [];
}

export async function markMessageRead(id, msgId) {
  const project = await getProjectById(id);
  if (!project) return null;
  const messages = (project.messages || []).map(m =>
    m.id === msgId ? { ...m, read: true } : m
  );
  const { data, error } = await supabase
    .from("projects")
    .update({ messages, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] markMessageRead:", error.message); return null; }
  return data;
}

export async function markAllMessagesRead(id) {
  const project = await getProjectById(id);
  if (!project) return null;
  const messages = (project.messages || []).map(m => ({ ...m, read: true }));
  const { data, error } = await supabase
    .from("projects")
    .update({ messages, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) { console.error("[store] markAllMessagesRead:", error.message); return null; }
  return data;
}

// ── Analytics helpers ─────────────────────────────────────────────────────────
export async function getStats() {
  const projects = await getProjects();
  const accounts = await getAccounts();
  return {
    totalProjects: projects.length,
    totalClients: accounts.length,
    byStatus: {
      active: projects.filter(p => p.status === "active").length,
      "in-analysis": projects.filter(p => p.status === "in-analysis").length,
      "pending-delivery": projects.filter(p => p.status === "pending-delivery").length,
      completed: projects.filter(p => p.status === "completed").length,
      cancelled: projects.filter(p => p.status === "cancelled").length,
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
