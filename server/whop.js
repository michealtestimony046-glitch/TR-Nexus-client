import Whop from "@whop/sdk";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { SERVICES } from "../src/services.js";

export const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID || "";
export const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET || "";
export const WHOP_API_KEY = process.env.WHOP_API_KEY || "";

export const WHOP_PLAN_IDS = parsePlanIds(process.env.WHOP_PLAN_IDS);

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
  const aliases = {
    "Launch Validation": "launch-validation",
    "Launch Intelligence": "qa-insights",
    "Launch Assurance": "launch-assurance",
    "Custom QA Solutions": "custom-qa",
    "Optional Add-Ons": "add-ons",
  };
  if (service === "Custom QA Solutions" || service === "Optional Add-Ons" || service === "custom-qa" || service === "add-ons") return "";
  return WHOP_PLAN_IDS[service] || WHOP_PLAN_IDS[aliases[service]] || "";
}

export function isWhopConfigured(service) {
  return Boolean(WHOP_API_KEY && WHOP_COMPANY_ID && WHOP_WEBHOOK_SECRET && getWhopPlanId(service));
}

export function createWhopClient() {
  if (!WHOP_API_KEY) throw new Error("WHOP_API_KEY is not configured.");
  return new Whop({
    apiKey: WHOP_API_KEY,
    ...(process.env.WHOP_API_BASE_URL ? { baseURL: process.env.WHOP_API_BASE_URL } : {}),
  });
}

export function verifyWhopWebhook(rawBody, headers) {
  return unwrapWebhook(rawBody, {
    headers,
    key: WHOP_WEBHOOK_SECRET,
  });
}

export function moneyValue(money) {
  if (!money) return { amount: null, currency: null };
  return {
    amount: money.amount ?? money.value ?? null,
    currency: String(money.currency || "").toUpperCase() || null,
  };
}

export function advertisedPrice(project) {
  const service = SERVICES.flatMap((category) => category.items || []).find(
    (item) => item.id === project?.service || item.name === project?.service
  );
  const match = String(service?.price || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}
