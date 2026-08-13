import { Router } from "express";
import crypto from "crypto";
import {
  validateSession,
  getProjectsByEmail,
  createProject,
  genProjectId,
  getAllProjects,
  getProjectById,
  updateProjectStatus,
  savePaymentRequest,
  confirmPayment,
  rejectPayment,
  saveFeedback,
  saveMessage,
  getMessages,
  markMessageRead,
} from "../store.js";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tragency001$";

function getToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

function getUser(req) {
  return validateSession(getToken(req));
}

function isAdmin(req) {
  return (req.headers["x-admin-key"] || "") === ADMIN_PASSWORD;
}

function unauthorized(res) {
  return res.status(401).json({ ok: false, error: "Unauthorized." });
}

// ── GET /api/projects ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return unauthorized(res);

    const projects = await getProjectsByEmail(user.email);
    return res.json({ ok: true, projects });
  } catch (err) {
    console.error("[projects/get]", err);
    return res.status(500).json({ ok: false, error: "Failed to load projects." });
  }
});

// ── GET /api/projects/all — admin only ────────────────────────────────────────
router.get("/all", async (req, res) => {
  try {
    if (!isAdmin(req)) return unauthorized(res);

    const projects = await getAllProjects();
    return res.json({ ok: true, projects });
  } catch (err) {
    console.error("[projects/all]", err);
    return res.status(500).json({ ok: false, error: "Failed to load projects." });
  }
});

// ── POST /api/projects ────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return unauthorized(res);

    const {
      service,
      price,
      projectUrl,
      projectType,
      stage,
      mainIssue,
      referralSource,
      promoterCode,
      submittedAt,
    } = req.body || {};

    const id = genProjectId();

    // The current Neon projects table stores the core project record plus its
    // chat/messages JSON. Keep the intake data in the first record so no
    // request data is lost even though the old file-store columns no longer exist.
    const intake = {
      id: `intake-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      type: "intake",
      sender: "system",
      senderName: user.name || "Client",
      timestamp: submittedAt || new Date().toISOString(),
      read: true,
      data: {
        name: user.name || "",
        email: user.email,
        service: service || "General Consult",
        price: price || "—",
        projectUrl: projectUrl || "",
        projectType: projectType || "",
        stage: stage || "",
        mainIssue: mainIssue || "",
        referralSource: referralSource || "",
        promoterCode: promoterCode || null,
      },
    };

    const created = await createProject({
      id,
      email: user.email,
      service: service || "General Consult",
      status: "active",
      submittedAt: submittedAt || new Date().toISOString(),
      messages: [intake],
    });

    // Return the full intake payload to the frontend so it can immediately
    // render the initialized project even though the Neon table is normalized.
    const project = {
      ...created,
      id,
      email: user.email,
      name: user.name || "",
      service: service || "General Consult",
      price: price || "—",
      projectUrl: projectUrl || "",
      projectType: projectType || "",
      stage: stage || "",
      mainIssue: mainIssue || "",
      referralSource: referralSource || "",
      promoterCode: promoterCode || null,
      submittedAt: submittedAt || new Date().toISOString(),
      status: created?.status || "active",
    };

    return res.status(201).json({ ok: true, project });
  } catch (err) {
    console.error("[projects/post]", err);
    return res.status(500).json({ ok: false, error: "Failed to save project." });
  }
});

// ── PATCH /api/projects/:id/cancel ────────────────────────────────────────────
router.patch("/:id/cancel", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return unauthorized(res);

    const existing = await getProjectById(req.params.id);
    if (!existing || existing.email?.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(404).json({ ok: false, error: "Project not found." });
    }

    const project = await updateProjectStatus(req.params.id, "pending-cancellation");
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

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
              { name: "Client", value: user.name || "Client", inline: true },
              { name: "Email", value: user.email, inline: true },
              { name: "Service", value: project.service || "—", inline: false },
            ],
            footer: { text: "Admin approval needed" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/cancel]", err);
    return res.status(500).json({ ok: false, error: "Failed to cancel project." });
  }
});

// ── PATCH /api/projects/:id/accept-delivery ───────────────────────────────────
router.patch("/:id/accept-delivery", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return unauthorized(res);

    const existing = await getProjectById(req.params.id);
    if (!existing || existing.email?.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(404).json({ ok: false, error: "Project not found." });
    }

    const project = await updateProjectStatus(req.params.id, "completed");
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/accept-delivery]", err);
    return res.status(500).json({ ok: false, error: "Failed to accept delivery." });
  }
});

// ── POST /api/projects/:id/payment-request ────────────────────────────────────
router.post("/:id/payment-request", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return unauthorized(res);

    const existing = await getProjectById(req.params.id);
    if (!existing || existing.email?.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(404).json({ ok: false, error: "Project not found." });
    }

    let { amount, currency, paymentMethod, receiptImage, timestamp } = req.body || {};

    if (!amount || !currency || !paymentMethod) {
      return res.json({ ok: false, error: "Missing payment details." });
    }
    if (!receiptImage) {
      return res.json({ ok: false, error: "Receipt image is required." });
    }

    if (typeof receiptImage !== "string") {
      return res.json({ ok: false, error: "Invalid receipt image. Please re-upload." });
    }

    receiptImage = receiptImage.replace(/\s/g, "");
    if (!receiptImage.startsWith("data:")) {
      receiptImage = `data:image/jpeg;base64,${receiptImage}`;
    }
    if (!receiptImage.includes("base64,")) {
      return res.json({ ok: false, error: "Invalid receipt image format. Please try a different image." });
    }
    if (receiptImage.length > 8_000_000) {
      return res.json({ ok: false, error: "Receipt image is too large. Please use a smaller image." });
    }

    const payment = {
      amount: parseFloat(amount) || amount,
      currency,
      method: paymentMethod,
      network: paymentMethod === "usdt" ? "TRC20" : paymentMethod === "usdc" ? "Solana" : null,
      status: "pending",
      receiptImage,
      requested_at: timestamp || new Date().toISOString(),
    };

    const project = await savePaymentRequest(req.params.id, payment);
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/payment-request]", err);
    return res.status(500).json({ ok: false, error: "Failed to save payment. Please try again." });
  }
});

// ── PATCH /api/projects/:id/confirm-payment — admin ──────────────────────────
router.patch("/:id/confirm-payment", async (req, res) => {
  try {
    if (!isAdmin(req)) return unauthorized(res);

    const project = await confirmPayment(req.params.id);
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/confirm-payment]", err);
    return res.status(500).json({ ok: false, error: "Failed to confirm payment." });
  }
});

// ── PATCH /api/projects/:id/reject-payment — admin ───────────────────────────
router.patch("/:id/reject-payment", async (req, res) => {
  try {
    if (!isAdmin(req)) return unauthorized(res);

    const project = await rejectPayment(req.params.id);
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/reject-payment]", err);
    return res.status(500).json({ ok: false, error: "Failed to reject payment." });
  }
});

// ── POST /api/projects/:id/feedback ──────────────────────────────────────────
router.post("/:id/feedback", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return unauthorized(res);

    const existing = await getProjectById(req.params.id);
    if (!existing || existing.email?.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(404).json({ ok: false, error: "Project not found." });
    }

    const { rating, comment } = req.body || {};
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.json({ ok: false, error: "Rating must be between 1–5." });
    }

    const project = await saveFeedback(req.params.id, {
      rating: Number(rating),
      comment: comment || "",
      submitted_at: new Date().toISOString(),
    });
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/feedback]", err);
    return res.status(500).json({ ok: false, error: "Failed to save feedback." });
  }
});

// ── CHAT SYSTEM ───────────────────────────────────────────────────────────────
router.post("/:id/messages", async (req, res) => {
  try {
    const token = getToken(req);
    const user = await validateSession(token);
    const admin = isAdmin(req);

    if (!user && !admin) return unauthorized(res);

    const existing = await getProjectById(req.params.id);
    if (!existing) return res.status(404).json({ ok: false, error: "Project not found." });
    if (!admin && existing.email?.toLowerCase() !== user.email.toLowerCase()) {
      return unauthorized(res);
    }

    const { type, content, senderName, sender } = req.body || {};
    if (!type || !content) {
      return res.json({ ok: false, error: "Missing message fields." });
    }

    if (type === "image" && typeof content === "string" && content.length > 5_000_000) {
      return res.json({ ok: false, error: "Image too large. Please compress or use a smaller image." });
    }

    const message = {
      id: `msg-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      sender: admin ? "admin" : "client",
      senderName: admin ? "T/R Agency Team" : (senderName || user.name || "Client"),
      type,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const project = await saveMessage(req.params.id, message);
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, message, project });
  } catch (err) {
    console.error("[projects/messages/post]", err);
    return res.status(500).json({ ok: false, error: "Failed to send message." });
  }
});

router.get("/:id/messages", async (req, res) => {
  try {
    const user = await validateSession(getToken(req));
    const admin = isAdmin(req);

    if (!user && !admin) return unauthorized(res);

    const existing = await getProjectById(req.params.id);
    if (!existing) return res.status(404).json({ ok: false, error: "Project not found." });
    if (!admin && existing.email?.toLowerCase() !== user.email.toLowerCase()) {
      return unauthorized(res);
    }

    const messages = await getMessages(req.params.id);
    return res.json({ ok: true, messages });
  } catch (err) {
    console.error("[projects/messages/get]", err);
    return res.status(500).json({ ok: false, error: "Failed to load messages." });
  }
});

router.patch("/:id/messages/:msgId/read", async (req, res) => {
  try {
    const user = await validateSession(getToken(req));
    const admin = isAdmin(req);

    if (!user && !admin) return unauthorized(res);

    const existing = await getProjectById(req.params.id);
    if (!existing) return res.status(404).json({ ok: false, error: "Project not found." });
    if (!admin && existing.email?.toLowerCase() !== user.email.toLowerCase()) {
      return unauthorized(res);
    }

    const project = await markMessageRead(req.params.id, req.params.msgId);
    if (!project) return res.status(404).json({ ok: false, error: "Not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/messages/read]", err);
    return res.status(500).json({ ok: false, error: "Failed to mark as read." });
  }
});

// ── PATCH /api/projects/:id — admin status update (MUST be last) ──────────────
router.patch("/:id", async (req, res) => {
  try {
    if (!isAdmin(req)) return unauthorized(res);

    const { status } = req.body || {};
    const valid = [
      "active",
      "in-analysis",
      "pending-delivery",
      "completed",
      "pending-cancellation",
      "cancelled",
    ];
    if (!valid.includes(status)) return res.json({ ok: false, error: "Invalid status." });

    const project = await updateProjectStatus(req.params.id, status);
    if (!project) return res.status(404).json({ ok: false, error: "Project not found." });

    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/patch]", err);
    return res.status(500).json({ ok: false, error: "Failed to update project." });
  }
});

export default router;
