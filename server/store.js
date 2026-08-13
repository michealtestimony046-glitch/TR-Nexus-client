import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

// Neon is now the application's only database backend.
// Set DATABASE_URL in Render to the connection string from the Neon dashboard.
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error("[store] DATABASE_URL is not configured.");
}

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

function db() {
  if (!sql) throw new Error("DATABASE_URL is not configured.");
  return sql;
}

function json(value) {
  return JSON.stringify(value ?? {});
}

// ── Password hashing ──────────────────────────────────────────────────────────
const SALT = "tr_agency_ops_2026_salt";
export function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw + SALT).digest("hex");
}

// ── Accounts ──────────────────────────────────────────────────────────────────
export async function getAccounts() {
  try {
    return await db()`
      SELECT *
      FROM accounts
      ORDER BY created_at ASC
    `;
  } catch (err) {
    console.error("[store] getAccounts:", err);
    return [];
  }
}

export async function findAccount(email) {
  try {
    const rows = await db()`
      SELECT *
      FROM accounts
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] findAccount:", err);
    throw err;
  }
}

export async function createAccount({ name, email, passwordHash, verified = true }) {
  const existing = await findAccount(email);
  if (existing) throw new Error("Account already exists.");

  const rows = await db()`
    INSERT INTO accounts (name, email, password_hash, verified)
    VALUES (${name}, ${email}, ${passwordHash}, ${verified})
    RETURNING *
  `;

  return rows[0] || null;
}

export async function updatePasswordHash(email, passwordHash) {
  const rows = await db()`
    UPDATE accounts
    SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
    WHERE LOWER(email) = LOWER(${email})
    RETURNING *
  `;

  if (!rows[0]) throw new Error(`Account not found: ${email}`);
  return rows[0];
}

// ── Sessions ──────────────────────────────────────────────────────────────────
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(email) {
  const account = await findAccount(email);
  if (!account) throw new Error(`Account not found: ${email}`);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL;

  await db()`
    INSERT INTO sessions (token, email, expires_at)
    VALUES (${token}, ${account.email}, ${expiresAt})
  `;

  return { token, expiresAt };
}

export async function validateSession(token) {
  if (!token) return null;

  try {
    const rows = await db()`
      SELECT a.name, a.email
      FROM sessions s
      INNER JOIN accounts a ON LOWER(a.email) = LOWER(s.email)
      WHERE s.token = ${token}
        AND s.expires_at > ${Date.now()}
      LIMIT 1
    `;

    return rows[0] ? { name: rows[0].name, email: rows[0].email } : null;
  } catch (err) {
    console.error("[store] validateSession:", err);
    return null;
  }
}

export async function revokeSession(token) {
  try {
    await db()`
      DELETE FROM sessions
      WHERE token = ${token}
    `;
  } catch (err) {
    console.error("[store] revokeSession:", err);
  }
}

// ── Pending codes (verify + reset) ────────────────────────────────────────────
async function cleanPending() {
  await db()`
    DELETE FROM pending
    WHERE expires_at < ${Date.now()}
  `;
}

export async function createVerifyPending({
  name,
  email,
  passwordHash,
  code,
  ttl = 10 * 60 * 1000,
}) {
  await cleanPending();

  await db()`
    DELETE FROM pending
    WHERE type = 'verify'
      AND LOWER(email) = LOWER(${email})
  `;

  await db()`
    INSERT INTO pending (type, name, email, password_hash, code, expires_at, used)
    VALUES ('verify', ${name}, ${email}, ${passwordHash}, ${code}, ${Date.now() + ttl}, false)
  `;
}

export async function createResetPending({
  email,
  code,
  ttl = 15 * 60 * 1000,
}) {
  await cleanPending();

  await db()`
    DELETE FROM pending
    WHERE type = 'reset'
      AND LOWER(email) = LOWER(${email})
  `;

  await db()`
    INSERT INTO pending (type, email, code, expires_at, used)
    VALUES ('reset', ${email}, ${code}, ${Date.now() + ttl}, false)
  `;
}

export async function consumePending(type, email, code) {
  await cleanPending();

  const rows = await db()`
    SELECT *
    FROM pending
    WHERE type = ${type}
      AND LOWER(email) = LOWER(${email})
      AND code = ${code}
      AND used = false
      AND expires_at > ${Date.now()}
    ORDER BY id DESC
    LIMIT 1
  `;

  const data = rows[0];
  if (!data) return null;

  // Delete immediately so a verification/reset code is single-use.
  await db()`
    DELETE FROM pending
    WHERE id = ${data.id}
  `;

  return {
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
  };
}

// ── Rate limiting (in-memory — fine to keep as-is, doesn't need persistence) ──
const rateLimitMap = new Map();
const RATE_WINDOW = 60 * 1000;
const RATE_MAX = 5;

export function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, resetAt: now + RATE_WINDOW };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_WINDOW;
  }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= RATE_MAX;
}

// ── Projects ──────────────────────────────────────────────────────────────────
export async function getProjects() {
  try {
    return await db()`
      SELECT *
      FROM projects
      ORDER BY submitted_at DESC
    `;
  } catch (err) {
    console.error("[store] getProjects:", err);
    return [];
  }
}

export async function getProjectsByEmail(email) {
  try {
    return await db()`
      SELECT *
      FROM projects
      WHERE LOWER(email) = LOWER(${email})
      ORDER BY submitted_at DESC
    `;
  } catch (err) {
    console.error("[store] getProjectsByEmail:", err);
    return [];
  }
}

export async function createProject(project) {
  const rows = await db()`
    INSERT INTO projects (
      id, email, service, status, submitted_at, messages
    )
    VALUES (
      ${project.id},
      ${project.email},
      ${project.service},
      ${project.status || "active"},
      ${project.submittedAt || new Date().toISOString()},
      ${json(project.messages || [])}::jsonb
    )
    RETURNING *
  `;

  return rows[0] || project;
}

export function genProjectId() {
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `TR-2026-${num}`;
}

export async function getAllProjects() {
  return getProjects();
}

export async function updateProjectStatus(id, status) {
  try {
    const rows = await db()`
      UPDATE projects
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] updateProjectStatus:", err);
    return null;
  }
}

export async function getProjectById(id) {
  try {
    const rows = await db()`
      SELECT *
      FROM projects
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] getProjectById:", err);
    return null;
  }
}

// ── Payments ─────────────────────────────────────────────────────────────────
export async function savePaymentRequest(id, payment) {
  try {
    const rows = await db()`
      UPDATE projects
      SET payment = ${json({
        ...payment,
        status: "pending",
        requested_at: payment.requested_at || new Date().toISOString(),
      })}::jsonb,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] savePaymentRequest:", err);
    return null;
  }
}

export async function confirmPayment(id) {
  const project = await getProjectById(id);
  if (!project) return null;

  const payment = {
    ...(project.payment || {}),
    status: "paid",
    confirmed_at: new Date().toISOString(),
  };

  try {
    const rows = await db()`
      UPDATE projects
      SET payment = ${json(payment)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] confirmPayment:", err);
    return null;
  }
}

export async function rejectPayment(id) {
  const project = await getProjectById(id);
  if (!project) return null;

  const payment = {
    ...(project.payment || {}),
    status: "rejected",
    rejected_at: new Date().toISOString(),
  };

  try {
    const rows = await db()`
      UPDATE projects
      SET payment = ${json(payment)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] rejectPayment:", err);
    return null;
  }
}

// ── Feedback ──────────────────────────────────────────────────────────────────
export async function saveFeedback(id, feedback) {
  try {
    const rows = await db()`
      UPDATE projects
      SET feedback = ${json({
        ...feedback,
        submitted_at: feedback.submitted_at || new Date().toISOString(),
      })}::jsonb,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] saveFeedback:", err);
    return null;
  }
}

// ── Chat Messages ─────────────────────────────────────────────────────────────
export async function saveMessage(id, message) {
  const project = await getProjectById(id);
  if (!project) return null;

  const messages = [...(project.messages || []), message];

  try {
    const rows = await db()`
      UPDATE projects
      SET messages = ${json(messages)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] saveMessage:", err);
    return null;
  }
}

export async function getMessages(id) {
  const project = await getProjectById(id);
  return project?.messages || [];
}

export async function markMessageRead(id, msgId) {
  const project = await getProjectById(id);
  if (!project) return null;

  const messages = (project.messages || []).map((m) =>
    m.id === msgId ? { ...m, read: true } : m
  );

  try {
    const rows = await db()`
      UPDATE projects
      SET messages = ${json(messages)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] markMessageRead:", err);
    return null;
  }
}

export async function markAllMessagesRead(id) {
  const project = await getProjectById(id);
  if (!project) return null;

  const messages = (project.messages || []).map((m) => ({ ...m, read: true }));

  try {
    const rows = await db()`
      UPDATE projects
      SET messages = ${json(messages)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("[store] markAllMessagesRead:", err);
    return null;
  }
}

// ── Analytics helpers ─────────────────────────────────────────────────────────
export async function getStats() {
  const projects = await getProjects();
  const accounts = await getAccounts();

  return {
    totalProjects: projects.length,
    totalClients: accounts.length,
    byStatus: {
      active: projects.filter((p) => p.status === "active").length,
      "in-analysis": projects.filter((p) => p.status === "in-analysis").length,
      "pending-delivery": projects.filter((p) => p.status === "pending-delivery").length,
      completed: projects.filter((p) => p.status === "completed").length,
      cancelled: projects.filter((p) => p.status === "cancelled").length,
    },
    pendingPayments: projects.filter((p) => p.payment?.status === "pending").length,
    confirmedPayments: projects.filter((p) => p.payment?.status === "paid").length,
    totalRevenue: projects
      .filter((p) => p.payment?.status === "paid")
      .reduce((sum, p) => sum + (parseFloat(p.payment?.amount) || 0), 0),
    avgRating: (() => {
      const rated = projects.filter((p) => p.feedback?.rating);
      if (!rated.length) return null;
      return (
        rated.reduce((s, p) => s + Number(p.feedback.rating), 0) / rated.length
      ).toFixed(1);
    })(),
  };
}
