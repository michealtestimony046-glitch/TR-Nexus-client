import { WhopClient } from "@whop/sdk";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { SERVICES } from "../src/services.js";

export const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID || "";
export const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || "";
export const WHOP_API_KEY = process.env.WHOP_API_KEY || "";

export const WHOP_PLAN_IDS = parsePlanIds(process.env.WHOP_PLAN_IDS);

const SERVICE_PLAN_KEYS = {
  "launch validation": "launch-validation",
  "launch-validation": "launch-validation",
  "launch intelligence": "qa-insights",
  "qa-insights": "qa-insights",
  "launch assurance": "launch-assurance",
  "launch-assurance": "launch-assurance",
};

function parsePlanIds(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error("[whop] Invalid WHOP_PLAN_IDS JSON:", error.message);
    return {};
  }
}

export function getWhopPlanId(service) {
  const rawService = String(service || "").trim();
  const planKey = SERVICE_PLAN_KEYS[rawService.toLowerCase()];
  if (!planKey) return "";
  return WHOP_PLAN_IDS[planKey] || WHOP_PLAN_IDS[rawService] || "";
}

export function isWhopConfigured(service) {
  return Boolean(WHOP_API_KEY && WHOP_WEBHOOK_SECRET && getWhopPlanId(service));
}

export function createWhopCheckoutConfigurationInput({ planId, projectId, redirectUrl }) {
  return {
    plan_id: planId,
    mode: "payment",
    metadata: { project_id: projectId },
    ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
  };
}

export function getWhopEnvironment() {
  return /sandbox-api\.whop\.com/i.test(process.env.WHOP_API_BASE_URL || "")
    ? "sandbox"
    : "production";
}

export function createWhopClient() {
  if (!WHOP_API_KEY) throw new Error("WHOP_API_KEY is not configured.");
  return new WhopClient({
    token: WHOP_API_KEY,
    ...(process.env.WHOP_API_BASE_URL ? { baseUrl: process.env.WHOP_API_BASE_URL } : {}),
  });
}

export function verifyWhopWebhook(rawBody, headers) {
  return unwrapWebhook(rawBody, {
    headers,
    key: WHOP_WEBHOOK_SECRET,
  });
}

export function moneyValue(money, currency = null) {
  if (money == null) return { amount: null, currency: String(currency || "").toUpperCase() || null };
  if (typeof money !== "object") {
    return { amount: money, currency: String(currency || "").toUpperCase() || null };
  }
  return {
    amount: money.amount ?? money.value ?? null,
    currency: String(money.currency || currency || "").toUpperCase() || null,
  };
}

export function advertisedPrice(project) {
  const service = SERVICES.flatMap((category) => category.items || []).find(
    (item) => item.id === project?.service || item.name === project?.service
  );
  const match = String(service?.price || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}
