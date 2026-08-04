import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import passportInstance from "./passport.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || (isProd ? 5000 : 3001);

// ── CORS ──────────────────────────────────────────────────────────────────────
// When FRONTEND_URL is set (split deploy: Render backend + Vercel frontend),
// restrict origins to that value only.
// When FRONTEND_URL is not set (same-origin deploy or local dev), allow all.
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || null;

app.use(
  cors({
    origin: FRONTEND_ORIGIN
      ? (origin, cb) => {
          // Allow no-origin (server-to-server / curl) and the configured frontend
          if (!origin || origin === FRONTEND_ORIGIN) return cb(null, true);
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true, // No restriction when FRONTEND_URL is not configured
    credentials: true,
  })
);

// ── Body size limits ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── Session (used only for OAuth state handshake) ─────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,        // HTTPS only in production
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutes — just long enough to complete OAuth
    },
  })
);

// ── Passport (OAuth strategies) ───────────────────────────────────────────────
app.use(passportInstance.initialize());
app.use(passportInstance.session());

// ── Security headers ──────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ── Request logger (dev only) ─────────────────────────────────────────────────
if (!isProd) {
  app.use((req, _res, next) => {
    const size = req.headers["content-length"]
      ? `(${(parseInt(req.headers["content-length"]) / 1024).toFixed(1)}kb)`
      : "";
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${size}`);
    next();
  });
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    status: "operational",
    env: isProd ? "production" : "development",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// ── FIXED 404 handler (Express 5 safe) ────────────────────────────────────────
app.use("/api", (_req, res) => {
  res.status(404).json({
    ok: false,
    error: "API route not found.",
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message, err.stack);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      ok: false,
      error: "File too large. Maximum size is 20MB.",
    });
  }

  res.status(500).json({
    ok: false,
    error: isProd ? "Internal server error." : err.message,
  });
});

// ── Serve frontend in production ──────────────────────────────────────────────
if (isProd) {
  const DIST = path.join(__dirname, "../dist");

  // Never cache sw.js, index.html, or manifest so browsers always pick up updates
  app.use((req, res, next) => {
    if (/\/(sw\.js|index\.html|manifest\.webmanifest)$/.test(req.path)) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
    }
    next();
  });

  app.use(express.static(DIST, {
    maxAge: "1d",
    etag: true,
  }));

  // SPA fallback
  app.use((_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.sendFile(path.join(DIST, "index.html"));
  });
}

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔══════════════════════════════════════╗
║       T/R Agency — Server Ready      ║
╠══════════════════════════════════════╣
║  Port : ${PORT}
║  Mode : ${isProd ? "production" : "development"}
║  Body : 20mb limit
╚══════════════════════════════════════╝
  `);
});
