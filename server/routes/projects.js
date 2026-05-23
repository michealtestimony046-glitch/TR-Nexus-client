import { Router } from "express";
import { validateSession, getProjectsByEmail, createProject, genProjectId, getAllProjects, updateProjectStatus } from "../store.js";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tRadmin2026";

function getToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

function isAdmin(req) {
  const adminKey = req.headers["x-admin-key"] || "";
  return adminKey === ADMIN_PASSWORD;
}

// GET /api/projects
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

// GET /api/projects/all  — admin only
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

// POST /api/projects
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

// PATCH /api/projects/:id/cancel  — must be BEFORE /:id
router.patch("/:id/cancel", async (req, res) => {
  try {
    const user = validateSession(getToken(req));
    if (!user) return res.json({ ok: false, error: "Unauthorized." });

    const { id } = req.params;
    const project = updateProjectStatus(id, "cancelled");
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
            color: 0xff4444,
            fields: [
              { name: "Project ID", value: project.id, inline: true },
              { name: "Client", value: project.name, inline: true },
              { name: "Email", value: project.email, inline: true },
              { name: "Service", value: project.service, inline: false },
            ],
            footer: { text: "Client requested cancellation via portal" },
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

// PATCH /api/projects/:id  — admin only — must be AFTER /:id/cancel
router.patch("/:id", (req, res) => {
  try {
    if (!isAdmin(req)) return res.json({ ok: false, error: "Unauthorized." });
    const { id } = req.params;
    const { status } = req.body;
    const valid = ["active", "in-analysis", "completed", "cancelled"];
    if (!valid.includes(status)) return res.json({ ok: false, error: "Invalid status." });
    const project = updateProjectStatus(id, status);
    if (!project) return res.json({ ok: false, error: "Project not found." });
    return res.json({ ok: true, project });
  } catch (err) {
    console.error("[projects/patch]", err.message);
    return res.json({ ok: false, error: "Failed to update project." });
  }
});

export default router;
