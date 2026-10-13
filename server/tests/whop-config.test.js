import test from "node:test";
import assert from "node:assert/strict";

process.env.WHOP_PLAN_IDS = JSON.stringify({
  "launch-validation": "plan_validation",
  "qa-insights": "plan_insights",
  "launch-assurance": "plan_assurance",
});
process.env.WHOP_API_KEY = "whop_test_checkout_config_only";
process.env.WHOP_WEBHOOK_SECRET = "whsec_test_checkout_config_only";
process.env.WHOP_COMPANY_ID = "";

const {
  createWhopCheckoutConfigurationInput,
  createWhopClient,
  getWhopPlanId,
  getWhopEnvironment,
  isWhopConfigured,
} = await import("../whop.js");

test("display labels and service IDs resolve to the configured Whop plan keys", () => {
  assert.equal(getWhopPlanId("Launch Validation"), "plan_validation");
  assert.equal(getWhopPlanId("launch-validation"), "plan_validation");
  assert.equal(getWhopPlanId(" Launch Validation "), "plan_validation");
  assert.equal(getWhopPlanId("Launch Intelligence"), "plan_insights");
  assert.equal(getWhopPlanId("qa-insights"), "plan_insights");
  assert.equal(getWhopPlanId("Launch Assurance"), "plan_assurance");
  assert.equal(getWhopPlanId("launch-assurance"), "plan_assurance");
  assert.equal(getWhopPlanId("Custom QA Solutions"), "");
  assert.equal(isWhopConfigured("Launch Validation"), true);
});

test("existing-plan payment configuration uses plan_id and metadata without company_id", () => {
  assert.deepEqual(
    createWhopCheckoutConfigurationInput({
      planId: "plan_validation",
      projectId: "TR-2026-1000",
    }),
    {
      plan_id: "plan_validation",
      mode: "payment",
      metadata: { project_id: "TR-2026-1000" },
    }
  );
});

test("checkout configuration includes an optional redirect URL when one is configured", () => {
  assert.deepEqual(
    createWhopCheckoutConfigurationInput({
      planId: "plan_validation",
      projectId: "TR-2026-1000",
      redirectUrl: "https://portal.example/checkout/TR-2026-1000",
    }),
    {
      plan_id: "plan_validation",
      mode: "payment",
      metadata: { project_id: "TR-2026-1000" },
      redirect_url: "https://portal.example/checkout/TR-2026-1000",
    }
  );
});

test("sandbox API override uses the SDK's baseUrl option and selects sandbox embed", () => {
  const baseUrl = "https://sandbox-api.whop.com/api/v1";
  process.env.WHOP_API_BASE_URL = baseUrl;
  const client = createWhopClient();
  assert.equal(client._options.baseUrl, baseUrl);
  assert.equal(getWhopEnvironment(), "sandbox");
});

test("Whop SDK bearer token is sourced from WHOP_API_KEY", async () => {
  const client = createWhopClient();
  const auth = await client._options.authProvider.getAuthRequest();
  assert.equal(auth.headers.Authorization, "Bearer whop_test_checkout_config_only");
});

test("custom API URL does not silently label production as sandbox", () => {
  process.env.WHOP_API_BASE_URL = "https://api.whop.com/api/v1";
  assert.equal(getWhopEnvironment(), "production");
});
