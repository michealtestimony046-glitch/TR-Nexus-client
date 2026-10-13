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

function safeWebhookReason(error) {
  const message = error?.message || String(error || "Unknown error");
  return message
    .replace(/\b(?:whop|whsec|whsk|sk_live|sk_test)_[A-Za-z0-9_-]+\b/gi, "[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer [REDACTED]")
    .replace(/(WHOP_API_KEY|WHOP_WEBHOOK_SECRET)\s*[:=]\s*\S+/gi, "$1=[REDACTED]")
    .replace(/\s+/g, " ")
    .slice(0, 500);
}

function promoCodeValue(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.code || value.name || null;
  return null;
}

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
  }).catch((error) => console.error("[whop/discord]", safeWebhookReason(error)));
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
      await complete(eventId, paymentId, event.type || "unknown");
      return { kind: "ignored-risk-event" };
    }
    if (event.type !== "payment.succeeded") {
      console.log("[whop/webhook] Ignoring event", event.type || "unknown");
      await complete(eventId, paymentId, event.type || "unknown");
      return { kind: "ignored" };
    }
    if (!paymentId) {
      await alert("⚠️ Whop success event missing payment ID", `Event: ${eventId}. Payment was not marked paid.`, 0xff4444);
      return { kind: "rejected-payment-id" };
    }
    if (WHOP_COMPANY_ID && (payment.company_id || payment.account_id) &&
      (payment.company_id || payment.account_id) !== WHOP_COMPANY_ID) {
      await alert("⚠️ Whop payment company mismatch", `Payment: ${paymentId}\nReceived company/account: ${payment.company_id || payment.account_id}`, 0xff4444);
      return { kind: "rejected-company" };
    }

    const projectId = typeof payment.metadata?.project_id === "string" ? payment.metadata.project_id : "";
    if (!projectId) {
      await alert("⚠️ Whop payment missing project metadata", `Payment: ${paymentId}\nEvent: ${eventId}. It was not marked paid.`, 0xff4444);
      return { kind: "rejected-metadata" };
    }
    const project = await findProject(projectId);
    if (!project) {
      await alert("⚠️ Whop payment project not found", `Payment: ${paymentId}\nProject: ${projectId}. It was not marked paid.`, 0xff4444);
      return { kind: "rejected-project" };
    }
    const expectedPlan = planForService(project.service);
    const receivedPlan = planIdFromPayment(payment);
    if (!expectedPlan || receivedPlan !== expectedPlan) {
      await alert("⚠️ Whop payment plan mismatch", `Payment: ${paymentId}\nProject: ${projectId}\nExpected: ${expectedPlan || "not configured"}\nReceived: ${receivedPlan || "missing"}. It was not marked paid.`, 0xff4444);
      return { kind: "rejected-plan" };
    }
    if (project.payment?.status === "paid") {
      if (project.payment.whop_payment_id !== paymentId) {
        await alert("🚨 Possible duplicate payment", `Project: ${projectId}\nExisting payment: ${project.payment.whop_payment_id || "a different method"}\nNew Whop payment: ${paymentId}. No payment data was changed.`, 0xff4444);
        return { kind: "already-paid" };
      }
      await complete(eventId, paymentId, event.type);
      return { kind: "duplicate" };
    }

    const money = moneyValue(payment.total ?? payment.final_amount ?? payment.amount, payment.currency);
    const subtotal = moneyValue(payment.subtotal, payment.currency);
    const usdTotal = payment.usd_total == null
      ? { amount: money.currency === "USD" ? money.amount : null }
      : moneyValue(payment.usd_total, "USD");
    const promoCode = promoCodeValue(payment.promo_code);
    const paidAt = payment.paid_at || payment.created_at || event.timestamp || event.created_at || new Date().toISOString();
    const paymentToSave = {
      amount: money.amount,
      total: money.amount,
      usd_total: usdTotal.amount,
      subtotal: subtotal.amount,
      currency: money.currency,
      method: "whop",
      status: "paid",
      payment_method: payment.payment_method ?? null,
      payment_method_type: payment.payment_method_type ?? null,
      card_brand: payment.card_brand ?? null,
      card_last4: payment.card_last4 ?? null,
      card_exp_month: payment.card_exp_month ?? null,
      card_exp_year: payment.card_exp_year ?? null,
      membership_status: payment.membership?.status ?? null,
      promo_code: promoCode,
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
      return saved;
    }
    if (saved.kind !== "updated" && saved.kind !== "duplicate") {
      throw new Error(`Payment record returned ${saved?.kind || "no result"}.`);
    }
    const advertised = advertisedPrice(project);
    const paidAmountNumber = money.amount == null ? null : Number(money.amount);
    if (advertised !== null && (paidAmountNumber !== advertised || money.currency !== "USD")) {
      await alert("⚠️ Whop payment amount differs from advertised price", `Project: ${projectId}\nService: ${project.service || "—"}\nExpected/list price: $${advertised} USD\nPaid: ${money.amount ?? "unknown"} ${money.currency || "unknown"}\nSubtotal: ${subtotal.amount ?? "unknown"} ${subtotal.currency || money.currency || "unknown"}\nPromo code: ${promoCode || "none"}\nPayment: ${paymentId}. The verified payment was still recorded as paid.`);
    }
    if (saved.kind === "updated") {
      await alert("✅ Whop payment confirmed", `Project: ${projectId}\nService: ${project.service || "—"}\nPayment: ${paymentId}\nPaid: ${money.amount ?? "unknown"} ${money.currency || "unknown"}\nList price/subtotal: ${subtotal.amount ?? "unknown"} ${subtotal.currency || money.currency || "unknown"}\nPromo code: ${promoCode || "none"}\nProject status was not changed.`, 0x4ade80);
    }
    await complete(eventId, paymentId, event.type);
    return saved;
  } catch (error) {
    await release(eventId).catch(() => {});
    throw error;
  }
}

export function createWhopWebhookHandler({
  verifyWebhook = verifyWhopWebhook,
  processEvent = processWhopEvent,
  secretConfigured = Boolean(process.env.WHOP_WEBHOOK_SECRET),
  failureAlert = sendDiscordAlert,
  logger = console,
} = {}) {
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
      const projectId = typeof event?.data?.metadata?.project_id === "string" ? event.data.metadata.project_id : "unknown";
      const paymentId = typeof event?.data?.id === "string" ? event.data.id : "unknown";
      const reason = safeWebhookReason(error);
      logger.error("[whop/webhook] Processing failed", { projectId, paymentId, reason });
      try {
        await failureAlert("Whop webhook failed", `Project ID: ${projectId}\nPayment ID: ${paymentId}\nReason: ${reason}`, 0xff4444);
      } catch (alertError) {
        logger.error("[whop/webhook] Failure alert could not be sent", { projectId, paymentId, reason: safeWebhookReason(alertError) });
      }
      return res.status(500).json({ ok: false, error: "Webhook processing failed." });
    }
  };
}

router.post("/whop", createWhopWebhookHandler());
export default router;
