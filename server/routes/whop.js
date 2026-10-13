import { Router } from "express";
import {
  claimWhopEvent,
  completeWhopEvent,
  releaseWhopEvent,
  getProjectById,
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
const REFUND_OR_DISPUTE = /(refund|dispute|chargeback|resolution_center_case)/i;

async function sendDiscordAlert(title, description, color = 0xffaa00) {
  const webhookUrl = process.env.VITE_DISCORD_WEBHOOK_URL || "";
  if (!webhookUrl) {
    console.warn("[whop/discord] VITE_DISCORD_WEBHOOK_URL is not configured");
    return;
  }
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "T/R Agency — Whop",
      embeds: [{ title, description, color, timestamp: new Date().toISOString() }],
    }),
  }).then((response) => {
    if (!response.ok) console.error("[whop/discord] Discord returned", response.status);
  }).catch((error) => console.error("[whop/discord]", error.message));
}

function planIdFromPayment(payment) {
  const planId = payment?.plan_id || payment?.plan?.id || payment?.plan?.plan_id;
  return typeof planId === "string" ? planId : null;
}

export async function processWhopEvent(event, deps = {}) {
  const claim = deps.claimWhopEvent || claimWhopEvent;
  const complete = deps.completeWhopEvent || completeWhopEvent;
  const release = deps.releaseWhopEvent || releaseWhopEvent;
  const findProject = deps.getProjectById || getProjectById;
  const savePayment = deps.recordWhopPayment || recordWhopPayment;
  const planForService = deps.getWhopPlanId || getWhopPlanId;
  const alert = deps.sendDiscordAlert || sendDiscordAlert;

  if (event?.api_version && event.api_version !== "v1") {
    console.warn("[whop/webhook] Ignoring unsupported/missing API version", event?.api_version);
    if (event?.id) await alert("Whop webhook API version mismatch", `Event: ${event.type || "unknown"}; API version: ${event.api_version || "missing"}`);
    return { kind: "ignored-version" };
  }
  const eventId = typeof event?.id === "string" ? event.id : null;
  if (!eventId) {
    await alert("Whop webhook missing event ID", "A signature-verified webhook had no event ID and was not processed.", 0xff4444);
    return { kind: "ignored-missing-event-id" };
  }

  const payment = event?.data && typeof event.data === "object" ? event.data : {};
  const paymentId = typeof payment.id === "string" ? payment.id : null;
  const claimed = await claim(eventId, paymentId, event.type);
  if (!claimed) {
    console.log("[whop/webhook] Duplicate event/payment ignored", eventId, paymentId || "");
    return { kind: "duplicate" };
  }

  try {
    if (REFUND_OR_DISPUTE.test(event.type || "")) {
      await alert("⚠️ Whop refund or dispute event", `Event: ${event.type}\nEvent ID: ${eventId}\nPayment ID: ${paymentId || "—"}. No automatic payment or project status change was made.`);
      await complete(eventId);
      return { kind: "ignored-risk-event" };
    }
    if (event.type !== "payment.succeeded") {
      console.log("[whop/webhook] Ignoring event", event.type || "unknown");
      await complete(eventId);
      return { kind: "ignored" };
    }
    if (!paymentId) {
      await alert("⚠️ Whop success event missing payment ID", `Event: ${eventId}. Payment was not marked paid.`, 0xff4444);
      await complete(eventId);
      return { kind: "rejected-payment-id" };
    }
    if (WHOP_COMPANY_ID && (payment.company_id || payment.account_id) &&
      (payment.company_id || payment.account_id) !== WHOP_COMPANY_ID) {
      await alert("⚠️ Whop payment company mismatch", `Payment: ${paymentId}\nReceived company/account: ${payment.company_id || payment.account_id}`, 0xff4444);
      await complete(eventId);
      return { kind: "rejected-company" };
    }

    const projectId = typeof payment.metadata?.project_id === "string" ? payment.metadata.project_id : "";
    if (!projectId) {
      await alert("⚠️ Whop payment missing project metadata", `Payment: ${paymentId}\nEvent: ${eventId}. It was not marked paid.`, 0xff4444);
      await complete(eventId);
      return { kind: "rejected-metadata" };
    }
    const project = await findProject(projectId);
    if (!project) {
      await alert("⚠️ Whop payment project not found", `Payment: ${paymentId}\nProject: ${projectId}. It was not marked paid.`, 0xff4444);
      await complete(eventId);
      return { kind: "rejected-project" };
    }
    const expectedPlan = planForService(project.service);
    const receivedPlan = planIdFromPayment(payment);
    if (!expectedPlan || receivedPlan !== expectedPlan) {
      await alert("⚠️ Whop payment plan mismatch", `Payment: ${paymentId}\nProject: ${projectId}\nExpected: ${expectedPlan || "not configured"}\nReceived: ${receivedPlan || "missing"}. It was not marked paid.`, 0xff4444);
      await complete(eventId);
      return { kind: "rejected-plan" };
    }
    if (project.payment?.status === "paid") {
      if (project.payment.whop_payment_id !== paymentId) {
        await alert("🚨 Possible duplicate payment", `Project: ${projectId}\nExisting payment: ${project.payment.whop_payment_id || "a different method"}\nNew Whop payment: ${paymentId}. No payment data was changed.`, 0xff4444);
        await complete(eventId);
        return { kind: "already-paid" };
      }
      await complete(eventId);
      return { kind: "duplicate" };
    }

    const money = moneyValue(payment.total ?? payment.final_amount ?? payment.amount ?? payment.subtotal, payment.currency);
    const paidAt = payment.paid_at || payment.created_at || event.timestamp || event.created_at || new Date().toISOString();
    const paymentToSave = {
      amount: money.amount,
      currency: money.currency,
      method: "whop",
      status: "paid",
      whop_payment_id: paymentId,
      whop_event_id: eventId,
      whop_checkout_configuration_id: payment.checkout_configuration_id || null,
      confirmed_at: paidAt,
      paid_at: paidAt,
      requested_at: paidAt,
    };
    const saved = await savePayment(projectId, paymentToSave, eventId);
    if (saved.kind === "already-paid") {
      await alert("🚨 Possible duplicate payment", `Project: ${projectId}\nExisting payment: ${saved.project?.payment?.whop_payment_id || "a different method"}\nNew Whop payment: ${paymentId}. No payment data was changed.`, 0xff4444);
      await complete(eventId);
      return saved;
    }
    if (saved.kind !== "updated" && saved.kind !== "duplicate") {
      await alert("⚠️ Whop payment could not be recorded", `Project: ${projectId}\nPayment: ${paymentId}. Manual review is required.`, 0xff4444);
      await complete(eventId);
      return saved;
    }
    const advertised = advertisedPrice(project);
    if (advertised !== null && (money.amount !== advertised || money.currency !== "USD")) {
      await alert("⚠️ Whop payment amount differs from advertised price", `Project: ${projectId}\nService: ${project.service || "—"}\nExpected: $${advertised} USD\nReceived: ${money.amount ?? "unknown"} ${money.currency || "unknown"}\nPayment: ${paymentId}. The verified payment was still recorded as paid.`);
    }
    if (saved.kind === "updated") {
      await alert("✅ Whop payment confirmed", `Project: ${projectId}\nService: ${project.service || "—"}\nPayment: ${paymentId}\nAmount: ${money.amount ?? "unknown"} ${money.currency || "unknown"}\nProject status was not changed.`, 0x4ade80);
    }
    await complete(eventId);
    return saved;
  } catch (error) {
    await release(eventId).catch(() => {});
    throw error;
  }
}

export function createWhopWebhookHandler({ verifyWebhook = verifyWhopWebhook, processEvent = processWhopEvent, secretConfigured = Boolean(process.env.WHOP_WEBHOOK_SECRET) } = {}) {
  return async (req, res) => {
    if (!secretConfigured) return res.status(503).json({ ok: false, error: "Whop webhook secret is not configured." });
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    if (!rawBody) return res.status(400).json({ ok: false, error: "Missing raw webhook body." });
    let event;
    try {
      event = await verifyWebhook(rawBody, req.headers);
    } catch (error) {
      console.warn("[whop/webhook] Invalid signature:", error.message);
      return res.status(401).json({ ok: false, error: "Invalid webhook signature." });
    }
    try {
      const result = await processEvent(event);
      return res.status(200).json({ ok: true, result: result.kind });
    } catch (error) {
      console.error("[whop/webhook] Processing failed:", error);
      return res.status(500).json({ ok: false, error: "Webhook processing failed." });
    }
  };
}

router.post("/whop", createWhopWebhookHandler());
export default router;
