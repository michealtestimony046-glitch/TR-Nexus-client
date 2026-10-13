import test from "node:test";
import assert from "node:assert/strict";

process.env.WHOP_PLAN_IDS = JSON.stringify({ "launch-validation": "plan_test" });
const { processWhopEvent } = await import("./whop.js");

function fixture() {
  return {
    project: { id: "TR-2026-1000", service: "Launch Validation", price: "$49", payment: null },
    seen: new Set(),
    saved: [],
    alerts: [],
  };
}

function deps(state) {
  return {
    getProjectById: async () => state.project,
    hasProcessedWhopEvent: async (id) => state.seen.has(id),
    recordWhopPayment: async (_id, payment, eventId) => {
      state.seen.add(eventId);
      state.saved.push(payment);
      state.project.payment = payment;
      return { kind: "updated", project: state.project };
    },
    sendDiscordAlert: async (title) => state.alerts.push(title),
  };
}

function payment(overrides = {}) {
  return {
    id: "pay_test",
    account_id: null,
    plan_id: "plan_test",
    metadata: { project_id: "TR-2026-1000" },
    total: { amount: "49.00", currency: "usd" },
    paid_at: "2026-10-13T00:00:00.000Z",
    ...overrides,
  };
}

test("payment.succeeded marks the matching project paid with Whop identifiers", async () => {
  const state = fixture();
  const result = await processWhopEvent({
    id: "evt_test_1", api_version: "v1", type: "payment.succeeded", data: payment(),
  }, deps(state));
  assert.equal(result.kind, "updated");
  assert.equal(state.saved[0].whop_payment_id, "pay_test");
  assert.equal(state.saved[0].currency, "USD");
});

test("a duplicate event is ignored before writing again", async () => {
  const state = fixture();
  const event = { id: "evt_duplicate", api_version: "v1", type: "payment.succeeded", data: payment() };
  assert.equal((await processWhopEvent(event, deps(state))).kind, "updated");
  assert.equal((await processWhopEvent(event, deps(state))).kind, "duplicate");
  assert.equal(state.saved.length, 1);
});

test("a plan mismatch is rejected and never marks the project paid", async () => {
  const state = fixture();
  const result = await processWhopEvent({
    id: "evt_bad_plan", api_version: "v1", type: "payment.succeeded",
    data: payment({ plan_id: "plan_other" }),
  }, deps(state));
  assert.equal(result.kind, "rejected-plan");
  assert.equal(state.saved.length, 0);
  assert.equal(state.project.payment, null);
});

test("refund and dispute events are ignored and alerted", async () => {
  const state = fixture();
  const result = await processWhopEvent({
    id: "evt_refund", api_version: "v1", type: "payment.refunded", data: payment(),
  }, deps(state));
  assert.equal(result.kind, "ignored-risk-event");
  assert.equal(state.saved.length, 0);
  assert.equal(state.alerts.length, 1);
});
