import { Router } from "express";
import {
  validateSession, getProjectsByEmail, createProject, genProjectId,
  getAllProjects, updateProjectStatus, savePaymentRequest, confirmPayment,
  rejectPayment, saveFeedback, saveMessage, getMessages, markMessageRead
} from "../store.js";
import crypto from "crypto";

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tragency001$";

function getToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

function isAdmin(req) {
  return (req.headers["x-admin-key"] || "") === ADMIN_PASSWORD;
}

// ── GET /api/projects ─────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const user = validateSession(getToken(req));
    if (!user) return res.json({ ok: false, error: "Unauthorized." });
    const projects = getProjectsByEmail(user.email);
    return res.json({ ok: true, projects });
  } catch (err) {
    console.error("[projects/get]", err.message);
    return res.json({ ok: false, error: "Failed to load projects." });
  }
});

// ── GET /api/projects/all — admin only ────────────────────────────────────────
router.get("/all", (req, res) => {
  try {
    if (!isAdmin(req)) return res.json({ ok: false, error: "Unauthorized." });
    const projects = getAllProjects();
    return res.json({ ok: true, projects });
  } catch (err) {
    console.error("[projects/all]", err.message);
    return res.json({ ok: false, error: "Failed to load projects." });
  }
});

// ── POST /api/projects ────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  try {
    const user = validateSession(getToken(req));
    if (!user) return res.json({ ok: false, error: "Unauthorized." });

    const { service, price, projectUrl, projectType, stage, mainIssue, referralSource, promoterCode } = req.body;

    const project = createProject({
      id: genProjectId(),
      email: user.email,
      name: user.name,
      service: service || "General Consult",
      price: price || "—",
      projectUrl: projectUrl || "",
      projectType: projectType || "",
      stage: stage || "",
      mainIssue: mainIssue || "",
      referralSource: referralSource || "",
      promoterCode: promoterCode || null,
      submittedAt: new Date().toISOString(),
      status: "active",
    });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/post]", err.message);
    return res.json({ ok: false, error: "Failed to save project." });
  }
});

// ── PATCH /api/projects/:id/cancel ────────────────────────────────────────────
router.patch("/:id/cancel", async (req, res) => {
  try {
    const user = validateSession(getToken(req));
    if (!user) return res.json({ ok: false, error: "Unauthorized." });

    const project = updateProjectStatus(req.params.id, "pending-cancellation");
    if (!project) return res.json({ ok: false, error: "Project not found." });

    const webhookUrl = process.env.VITE_DISCORD_WEBHOOK_URL || "";
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "T/R Agency — System",
          embeds: [{
            title: "⚠️ Project Cancellation Request",
            color: 0xffaa00,
            fields: [
              { name: "Project ID", value: project.id, inline: true },
              { name: "Client",     value: project.name, inline: true },
              { name: "Email",      value: project.email, inline: true },
              { name: "Service",    value: project.service, inline: false },
            ],
            footer: { text: "Admin approval needed" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/cancel]", err.message);
    return res.json({ ok: false, error: "Failed to cancel project." });
  }
});

// ── PATCH /api/projects/:id/accept-delivery ───────────────────────────────────
router.patch("/:id/accept-delivery", async (req, res) => {
  try {
    const user = validateSession(getToken(req));
    if (!user) return res.json({ ok: false, error: "Unauthorized." });

    const project = updateProjectStatus(req.params.id, "completed");
    if (!project) return res.json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/accept-delivery]", err.message);
    return res.json({ ok: false, error: "Failed to accept delivery." });
  }
});

// ── POST /api/projects/:id/payment-request ────────────────────────────────────
router.post("/:id/payment-request", (req, res) => {
  try {
    const user = validateSession(getToken(req));
    if (!user) return res.json({ ok: false, error: "Unauthorized." });

    const { id } = req.params;
    let { amount, currency, paymentMethod, receiptImage, timestamp } = req.body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!amount || !currency || !paymentMethod) {
      return res.json({ ok: false, error: "Missing payment details." });
    }

    if (!receiptImage) {
      return res.json({ ok: false, error: "Receipt image is required." });
    }

    // ── Fix iOS/Safari base64 format issues ───────────────────────────────────
    // iOS sometimes strips the data: prefix or sends raw base64
    if (typeof receiptImage === "string") {
      // Remove any whitespace/newlines that iOS might inject
      receiptImage = receiptImage.replace(/\s/g, "");

      // If it doesn't have data: prefix, add it
      if (!receiptImage.startsWith("data:")) {
        receiptImage = `data:image/jpeg;base64,${receiptImage}`;
      }

      // Validate it looks like a proper data URL
      if (!receiptImage.includes("base64,")) {
        return res.json({ ok: false, error: "Invalid receipt image format. Please try a different image." });
      }
    } else {
      return res.json({ ok: false, error: "Invalid receipt image. Please re-upload." });
    }

    const payment = {
      amount:       parseFloat(amount) || amount,
      currency,
      method:       paymentMethod,
      network:      paymentMethod === "usdt" ? "TRC20" :
                    paymentMethod === "usdc" ? "Solana" : null,
      status:       "pending",
      receiptImage,
      requested_at: timestamp || new Date().toISOString(),
    };

    const project = savePaymentRequest(id, payment);
    if (!project) return res.json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/payment-request]", err.message, err.stack);
    return res.json({ ok: false, error: "Failed to save payment. Please try again." });
  }
});

// ── PATCH /api/projects/:id/confirm-payment — admin ──────────────────────────
router.patch("/:id/confirm-payment", (req, res) => {
  try {
    if (!isAdmin(req)) return res.json({ ok: false, error: "Unauthorized." });

    const project = confirmPayment(req.params.id);
    if (!project) return res.json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/confirm-payment]", err.message);
    return res.json({ ok: false, error: "Failed to confirm payment." });
  }
});

// ── PATCH /api/projects/:id/reject-payment — admin ───────────────────────────
router.patch("/:id/reject-payment", (req, res) => {
  try {
    if (!isAdmin(req)) return res.json({ ok: false, error: "Unauthorized." });

    const project = rejectPayment(req.params.id);
    if (!project) return res.json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/reject-payment]", err.message);
    return res.json({ ok: false, error: "Failed to reject payment." });
  }
});

// ── POST /api/projects/:id/feedback ──────────────────────────────────────────
router.post("/:id/feedback", (req, res) => {
  try {
    const user = validateSession(getToken(req));
    if (!user) return res.json({ ok: false, error: "Unauthorized." });

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.json({ ok: false, error: "Rating must be between 1–5." });
    }

    const project = saveFeedback(req.params.id, {
      rating,
      comment: comment || "",
      submitted_at: new Date().toISOString(),
    });
    if (!project) return res.json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/feedback]", err.message);
    return res.json({ ok: false, error: "Failed to save feedback." });
  }
});

// ── CHAT SYSTEM ───────────────────────────────────────────────────────────────

// POST /api/projects/:id/messages
router.post("/:id/messages", (req, res) => {
  try {
    const token = getToken(req);
    const user  = validateSession(token);
    const admin = isAdmin(req);

    if (!user && !admin) return res.json({ ok: false, error: "Unauthorized." });

    const { id } = req.params;
    let { type, content, senderName, sender } = req.body;

    if (!type || !content) {
      return res.json({ ok: false, error: "Missing message fields." });
    }

    // ── Strip oversized image content gracefully ───────────────────────────
    // Limit image messages to ~4MB base64
    if (type === "image" && typeof content === "string" && content.length > 5_000_000) {
      return res.json({ ok: false, error: "Image too large. Please compress or use a smaller image." });
    }

    const message = {
      id:         `msg-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      sender:     admin ? "admin" : (sender || "client"),
      senderName: senderName || (admin ? "T/R Agency Team" : user?.name || "Client"),
      type,
      content,
      timestamp:  new Date().toISOString(),
      read:       false,
    };

    const project = saveMessage(id, message);
    if (!project) return res.json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, message, project });
  } catch (err) {
    console.error("[projects/messages/post]", err.message);
    return res.json({ ok: false, error: "Failed to send message." });
  }
});

// GET /api/projects/:id/messages
router.get("/:id/messages", (req, res) => {
  try {
    const user  = validateSession(getToken(req));
    const admin = isAdmin(req);

    if (!user && !admin) return res.json({ ok: false, error: "Unauthorized." });

    const messages = getMessages(req.params.id);
    return res.json({ ok: true, messages });
  } catch (err) {
    console.error("[projects/messages/get]", err.message);
    return res.json({ ok: false, error: "Failed to load messages." });
  }
});

// PATCH /api/projects/:id/messages/:msgId/read
router.patch("/:id/messages/:msgId/read", (req, res) => {
  try {
    const user  = validateSession(getToken(req));
    const admin = isAdmin(req);

    if (!user && !admin) return res.json({ ok: false, error: "Unauthorized." });

    const project = markMessageRead(req.params.id, req.params.msgId);
    if (!project) return res.json({ ok: false, error: "Not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/messages/read]", err.message);
    return res.json({ ok: false, error: "Failed to mark as read." });
  }
});

// ── PATCH /api/projects/:id — admin status update (MUST be last) ──────────────
router.patch("/:id", (req, res) => {
  try {
    if (!isAdmin(req)) return res.json({ ok: false, error: "Unauthorized." });

    const { status } = req.body;
    const valid = ["active","in-analysis","pending-delivery","completed","pending-cancellation","cancelled"];
    if (!valid.includes(status)) return res.json({ ok: false, error: "Invalid status." });

    const project = updateProjectStatus(req.params.id, status);
    if (!project) return res.json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/patch]", err.message);
    return res.json({ ok: false, error: "Failed to update project." });
  }
});

export default router;
