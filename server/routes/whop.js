import { Router } from "express";
import {
  getProjectById,
  hasProcessedWhopEvent,
  recordWhopPayment,
} from "../store.js";
import {
  advertisedPrice,
  getWhopPlanId,
  moneyValue,
  verifyWhopWebhook,
  WHOP_COMPANY_ID,
} from "../whop.js";

const router = Router();
const REFUND_OR_DISPUTE = /(refund|dispute|chargeback)/i;

async function sendDiscordAlert(title, description, color = 0xffaa00) {
  const webhookUrl = process.env.VITE_DISCORD_WEBHOOK_URL || "";
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "T/R Agency — Whop",
      embeds: [{ title, description, color, timestamp: new Date().toISOString() }],
    }),
  }).catch((error) => console.error("[whop/discord]", error.message));
}

export async function processWhopEvent(event, deps = {}) {
  const findProject = deps.getProjectById || getProjectById;
  const seenEvent = deps.hasProcessedWhopEvent || hasProcessedWhopEvent;
  const savePayment = deps.recordWhopPayment || recordWhopPayment;
  const alert = deps.sendDiscordAlert || sendDiscordAlert;

  if (event.api_version && event.api_version !== "v1") {
    console.warn("[whop/webhook] Unsupported API version", event.api_version);
    return { kind: "ignored-version" };
  }
  if (REFUND_OR_DISPUTE.test(event.type || "")) {
    console.warn("[whop/webhook] Ignoring refund/dispute event", event.type);
    await alert("Whop refund or dispute event", `Event: ${event.type}\\nEvent ID: ${event.id}`);
    return { kind: "ignored-risk-event" };
  }
  if (event.type !== "payment.succeeded") {
    console.log("[whop/webhook] Ignoring event", event.type);
    return { kind: "ignored" };
  }
  if (!event.id || !event.data?.id) {
    console.warn("[whop/webhook] Missing event or payment ID");
    return { kind: "invalid" };
  }
  if (await seenEvent(event.id)) {
    console.log("[whop/webhook] Duplicate event", event.id);
    return { kind: "duplicate" };
  }

  const payment = event.data;
  if (WHOP_COMPANY_ID && payment.account_id && payment.account_id !== WHOP_COMPANY_ID) {
    await alert("Whop payment account mismatch", `Payment: ${payment.id}\\nAccount: ${payment.account_id}`);
    return { kind: "rejected-account" };
  }
  const metadata = payment.metadata || {};
  const projectId = metadata.project_id;
  if (!projectId) {
    console.warn("[whop/webhook] Missing trusted project metadata", payment.id);
    await alert("Whop payment missing project metadata", `Payment: ${payment.id}`);
    return { kind: "rejected-metadata" };
  }
  const project = await findProject(projectId);
  if (!project) {
    await alert("Whop payment project not found", `Payment: ${payment.id}\\nProject: ${projectId}`);
    return { kind: "rejected-project" };
  }
  const expectedPlan = getWhopPlanId(project.service);
  if (!expectedPlan || payment.plan_id !== expectedPlan) {
    console.warn("[whop/webhook] Plan mismatch", { projectId, expectedPlan, actual: payment.plan_id });
    await alert("Whop payment plan mismatch", `Payment: ${payment.id}\\nProject: ${projectId}\\nExpected: ${expectedPlan || "none"}\\nReceived: ${payment.plan_id || "none"}`);
    return { kind: "rejected-plan" };
  }

  const money = moneyValue(payment.total || payment.presentment_total || payment.subtotal);
  const recordedPayment = {
    amount: money.amount,
    currency: money.currency,
    whop_payment_id: payment.id,
    whop_checkout_configuration_id: payment.checkout_configuration_id || null,
    whop_event_id: event.id,
    paid_at: payment.paid_at || event.timestamp || new Date().toISOString(),
  };
  const result = await savePayment(projectId, recordedPayment, event.id);
  if (result.kind === "already-paid") {
    await alert("Possible duplicate Whop payment", `Project: ${projectId}\\nExisting payment: ${result.project?.payment?.whop_payment_id || "unknown"}\\nNew payment: ${payment.id}`);
    return result;
  }
  if (result.kind !== "updated") return result;

  const advertised = advertisedPrice(project);
  if (advertised !== null && Number(money.amount) !== advertised) {
    await alert("Whop payment amount mismatch", `Project: ${projectId}\\nAdvertised: ${advertised}\\nReceived: ${money.amount} ${money.currency}`);
  }
  await alert("Whop payment confirmed", `Project: ${projectId}\\nService: ${project.service || "—"}\\nPayment: ${payment.id}\\nAmount: ${money.amount} ${money.currency}`, 0x4ade80);
  return result;
}

router.post("/whop", async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  if (!rawBody) return res.status(400).json({ ok: false, error: "Missing raw webhook body." });
  try {
    const event = verifyWhopWebhook(rawBody, req.headers);
    const result = await processWhopEvent(event);
    return res.status(200).json({ ok: true, result: result.kind });
  } catch (error) {
    console.error("[whop/webhook] Rejected:", error.message);
    return res.status(400).json({ ok: false, error: "Invalid Whop webhook signature." });
  }
});

export default router;
