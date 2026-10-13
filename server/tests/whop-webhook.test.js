import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createWhopWebhookHandler, processWhopEvent } from "../routes/whop.js";

const PLAN = "plan_KMB5Sl5p2PDCA";
const SECRET = "whsec_test_only_secret";

function makeDeps() {
  const project = {
    id: "TR-TEST-123",
    email: "client@example.com",
    service: "Launch Validation",
    price: "$49",
    status: "in-analysis",
    payment: null,
  };
  const eventIds = new Set();
  const paymentIds = new Set();
  const alerts = [];
  return {
    project, alerts,
    async claimWhopEvent(eventId, paymentId, type) {
      if (eventIds.has(eventId)) return false;
      if (type === "payment.succeeded" && paymentId && paymentIds.has(paymentId)) return false;
      eventIds.add(eventId);
      if (type === "payment.succeeded" && paymentId) paymentIds.add(paymentId);
      return true;
    },
    async completeWhopEvent() {},
    async releaseWhopEvent(eventId) { eventIds.delete(eventId); },
    async getProjectById(id) { return id === project.id ? project : null; },
    getWhopPlanId(service) { return service === "Launch Validation" ? PLAN : ""; },
    async recordWhopPayment(id, payment) {
      if (id !== project.id) return { kind: "missing" };
      if (project.payment?.status === "paid") {
        return project.payment.whop_payment_id === payment.whop_payment_id
          ? { kind: "duplicate", project }
          : { kind: "already-paid", project };
      }
      const history = [...(project.payment?.history || []), ...(project.payment ? [project.payment] : [])];
      project.payment = { ...payment, status: "paid", method: "whop", history };
      return { kind: "updated", project };
    },
    async sendDiscordAlert(...args) { alerts.push(args); },
  };
}

function makeEvent(overrides = {}) {
  return {
    id: "evt_test_1",
    api_version: "v1",
    type: "payment.succeeded",
    data: {
      id: "pay_test_1",
      plan_id: PLAN,
      amount: 49,
      currency: "usd",
      paid_at: "2026-10-13T00:00:00.000Z",
      metadata: { project_id: "TR-TEST-123" },
      ...overrides,
    },
  };
}

function signedHeaders(rawBody, valid = true) {
  const id = "msg_test_1";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", Buffer.from(SECRET))
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");
  return {
    "webhook-id": id,
    "webhook-timestamp": timestamp,
    "webhook-signature": valid ? `v1,${signature}` : "v1,invalid",
  };
}

function testVerifier(rawBody, headers) {
  const signature = createHmac("sha256", Buffer.from(SECRET))
    .update(`${headers["webhook-id"]}.${headers["webhook-timestamp"]}.${rawBody}`)
    .digest("base64");
  if (headers["webhook-signature"] !== `v1,${signature}`) throw new Error("Invalid test signature");
  return JSON.parse(rawBody);
}

function responseStub() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("valid signed payment marks project paid without changing project status", async () => {
  const deps = makeDeps();
  const rawBody = JSON.stringify(makeEvent());
  const handler = createWhopWebhookHandler({
    verifyWebhook: testVerifier,
    processEvent: (event) => processWhopEvent(event, deps),
    secretConfigured: true,
  });
  const res = responseStub();
  await handler({ body: Buffer.from(rawBody), headers: signedHeaders(rawBody) }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(deps.project.payment.status, "paid");
  assert.equal(deps.project.payment.method, "whop");
  assert.equal(deps.project.payment.whop_payment_id, "pay_test_1");
  assert.equal(deps.project.payment.amount, 49);
  assert.equal(deps.project.payment.currency, "USD");
  assert.equal(deps.project.status, "in-analysis");
});

test("bad signature is rejected without changing payment", async () => {
  const deps = makeDeps();
  const rawBody = JSON.stringify(makeEvent());
  const handler = createWhopWebhookHandler({
    verifyWebhook: testVerifier,
    processEvent: (event) => processWhopEvent(event, deps),
    secretConfigured: true,
  });
  const res = responseStub();
  await handler({ body: Buffer.from(rawBody), headers: signedHeaders(rawBody, false) }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(deps.project.payment, null);
});

test("duplicate delivery and a second event ID for the same payment do not write or alert twice", async () => {
  const deps = makeDeps();
  assert.equal((await processWhopEvent(makeEvent(), deps)).kind, "updated");
  assert.equal((await processWhopEvent(makeEvent(), deps)).kind, "duplicate");
  assert.equal((await processWhopEvent({ ...makeEvent(), id: "evt_test_2" }, deps)).kind, "duplicate");
  assert.equal(deps.alerts.filter(([title]) => title.includes("payment confirmed")).length, 1);
});

test("wrong plan is rejected and alerted", async () => {
  const deps = makeDeps();
  const result = await processWhopEvent(makeEvent({ plan_id: "plan_wrong" }), deps);
  assert.equal(result.kind, "rejected-plan");
  assert.equal(deps.project.payment, null);
  assert.ok(deps.alerts.some(([title]) => title.includes("plan mismatch")));
});

test("missing metadata is rejected and alerted", async () => {
  const deps = makeDeps();
  const result = await processWhopEvent(makeEvent({ metadata: {} }), deps);
  assert.equal(result.kind, "rejected-metadata");
  assert.equal(deps.project.payment, null);
  assert.ok(deps.alerts.some(([title]) => title.includes("missing project metadata")));
});
