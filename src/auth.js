const SESSION_KEY = "tr_session";

export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!s) return null;
    if (Date.now() > s.expiresAt) { localStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch { return null; }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout() { localStorage.removeItem(SESSION_KEY); }

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function signup(name, email, password) {
  return post("/api/auth/signup", { name, email, password });
}

export async function verifyEmail(email, code) {
  const res = await post("/api/auth/verify", { email, code });
  if (res.ok && res.session) saveSession(res.session);
  return res;
}

export async function login(email, password) {
  const res = await post("/api/auth/login", { email, password });
  if (res.ok && res.session) saveSession(res.session);
  return res;
}

export async function forgotPassword(email) {
  return post("/api/auth/forgot", { email });
}

export async function resetPassword(email, code, newPassword) {
  return post("/api/auth/reset", { email, code, newPassword });
}
