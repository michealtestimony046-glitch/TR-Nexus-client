const ACCOUNTS_KEY = "tr_accounts";
const SESSION_KEY = "tr_session";
const VERIFY_KEY = "tr_pending_verify";
const RESET_KEY = "tr_pending_reset";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

function hashPassword(pw) {
  let hash = 0;
  const str = pw + "tr_agency_ops_2026";
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); }
  catch { return []; }
}
function saveAccounts(a) { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a)); }

export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!s) return null;
    if (Date.now() > s.expiresAt) { localStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch { return null; }
}
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email: user.email, name: user.name,
    expiresAt: Date.now() + SESSION_TTL,
  }));
}
export function logout() { localStorage.removeItem(SESSION_KEY); }

function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

export function signup(name, email, password) {
  const accounts = getAccounts();
  if (accounts.find((a) => a.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const code = genCode();
  localStorage.setItem(VERIFY_KEY, JSON.stringify({
    email, name, passwordHash: hashPassword(password),
    code, expiresAt: Date.now() + 15 * 60 * 1000,
  }));
  return { ok: true, code };
}

export function verifyEmail(email, inputCode) {
  try {
    const p = JSON.parse(localStorage.getItem(VERIFY_KEY));
    if (!p) return { ok: false, error: "No pending verification. Please sign up again." };
    if (p.email.toLowerCase() !== email.toLowerCase()) return { ok: false, error: "Email mismatch." };
    if (Date.now() > p.expiresAt) { localStorage.removeItem(VERIFY_KEY); return { ok: false, error: "Code expired. Please sign up again." }; }
    if (p.code !== inputCode.trim()) return { ok: false, error: "Incorrect code. Please try again." };
    const accounts = getAccounts();
    accounts.push({ email: p.email, name: p.name, passwordHash: p.passwordHash, verified: true, createdAt: new Date().toISOString() });
    saveAccounts(accounts);
    localStorage.removeItem(VERIFY_KEY);
    setSession({ email: p.email, name: p.name });
    return { ok: true };
  } catch { return { ok: false, error: "Verification failed." }; }
}

export function login(email, password) {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!account) return { ok: false, error: "No operational account found for this email." };
  if (!account.verified) return { ok: false, error: "Account not verified. Please complete email verification." };
  if (account.passwordHash !== hashPassword(password)) return { ok: false, error: "Incorrect password." };
  setSession(account);
  return { ok: true };
}

export function forgotPassword(email) {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!account) return { ok: false, error: "No operational account found for this email." };
  const code = genCode();
  localStorage.setItem(RESET_KEY, JSON.stringify({ email, code, expiresAt: Date.now() + 15 * 60 * 1000 }));
  return { ok: true, code };
}

export function resetPassword(email, inputCode, newPassword) {
  try {
    const p = JSON.parse(localStorage.getItem(RESET_KEY));
    if (!p) return { ok: false, error: "No active reset request. Please start again." };
    if (p.email.toLowerCase() !== email.toLowerCase()) return { ok: false, error: "Email mismatch." };
    if (Date.now() > p.expiresAt) { localStorage.removeItem(RESET_KEY); return { ok: false, error: "Code expired. Please request a new one." }; }
    if (p.code !== inputCode.trim()) return { ok: false, error: "Incorrect code. Please try again." };
    const accounts = getAccounts();
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { ok: false, error: "Account not found." };
    accounts[idx].passwordHash = hashPassword(newPassword);
    saveAccounts(accounts);
    localStorage.removeItem(RESET_KEY);
    return { ok: true };
  } catch { return { ok: false, error: "Reset failed." }; }
}
