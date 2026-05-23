import { Router } from "express";
import { validateSession, getProjectsByEmail, createProject, genProjectId } from "../store.js";

const router = Router();

function getToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
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

export default router;
