import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createWhopWebhookHandler, processWhopEvent } from "../routes/whop.js";

const PLAN = "plan_KMB5Sl5p2PDCA";
const SECRET = "whsec_test_only_secret";

function makeDeps() {
  const project = {
    id: "TR-TEST-123",
    service: "Launch Validation",
    price: "$49",
    status: "in-analysis",
    payment: null,
  };
  const processedEvents = new Set();
  const processedPayments = new Set();
  const alerts = [];
  const operations = [];
  return {
    project,
    alerts,
    operations,
    processedEvents,
    processedPayments,
    async claimWhopEvent(eventId, paymentId, type) {
      return !processedEvents.has(eventId) && !(type === "payment.succeeded" && paymentId && processedPayments.has(paymentId));
    },
    async completeWhopEvent(eventId, paymentId, type) {
      operations.push("event-completed");
      processedEvents.add(eventId);
      if (type === "payment.succeeded" && paymentId) processedPayments.add(paymentId);
    },
    async releaseWhopEvent() {},
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
      operations.push("payment-recorded");
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
      total: 49,
      usd_total: 49,
      subtotal: 49,
      currency: "usd",
      status: "paid",
      payment_method: "card",
      payment_method_type: "card",
      card_brand: "visa",
      card_last4: "4242",
      card_exp_month: 12,
      card_exp_year: 2030,
      promo_code: null,
      membership: { status: "completed" },
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

test("normal card payment records paid total and subtotal and marks project paid", async () => {
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
  assert.equal(deps.project.payment.total, 49);
  assert.equal(deps.project.payment.usd_total, 49);
  assert.equal(deps.project.payment.subtotal, 49);
  assert.equal(deps.project.payment.currency, "USD");
  assert.equal(deps.project.payment.payment_method, "card");
  assert.equal(deps.project.payment.card_brand, "visa");
  assert.equal(deps.project.payment.promo_code, null);
  assert.equal(deps.project.payment.membership_status, "completed");
  assert.equal(deps.project.status, "in-analysis");
});

test("free 100% promo order with null card fields preserves zero paid total and list-price subtotal", async () => {
  const deps = makeDeps();
  const freeOrder = makeEvent({
    id: "pay_test_free_1",
    total: 0,
    usd_total: 0,
    subtotal: 49,
    currency: "usd",
    status: "paid",
    payment_method: null,
    payment_method_type: null,
    card_brand: null,
    card_last4: null,
    card_exp_month: null,
    card_exp_year: null,
    promo_code: "trlaunchtest100",
    membership: { status: "completed" },
  });

  const result = await processWhopEvent(freeOrder, deps);

  assert.equal(result.kind, "updated");
  assert.equal(deps.project.payment.status, "paid");
  assert.equal(deps.project.payment.whop_payment_id, "pay_test_free_1");
  assert.equal(deps.project.payment.amount, 0);
  assert.equal(deps.project.payment.total, 0);
  assert.equal(deps.project.payment.usd_total, 0);
  assert.equal(deps.project.payment.subtotal, 49);
  assert.equal(deps.project.payment.currency, "USD");
  assert.equal(deps.project.payment.promo_code, "trlaunchtest100");
  assert.equal(deps.project.payment.payment_method, null);
  assert.equal(deps.project.payment.payment_method_type, null);
  assert.equal(deps.project.payment.card_brand, null);
  assert.equal(deps.project.payment.card_last4, null);
  assert.equal(deps.project.payment.card_exp_month, null);
  assert.equal(deps.project.payment.card_exp_year, null);
  assert.equal(deps.project.payment.membership_status, "completed");
  assert.equal(deps.project.status, "in-analysis");
  assert.ok(deps.alerts.some(([title, description]) => title.includes("amount differs") && description.includes("Paid: 0 USD")));
  assert.equal(Object.hasOwn(freeOrder.data, "customer_email"), false);
  assert.equal(Object.hasOwn(deps.project, "email"), false);
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
  assert.deepEqual(deps.operations, ["payment-recorded", "event-completed"]);
});

test("failed payment recording saves no event/payment ID and replay can retry successfully", async () => {
  const deps = makeDeps();
  const recordPayment = deps.recordWhopPayment;
  let failOnce = true;
  deps.recordWhopPayment = async (...args) => {
    if (failOnce) {
      failOnce = false;
      throw new Error("NeonDbError: could not determine data type of parameter $3 (code 42P18)");
    }
    return recordPayment(...args);
  };

  await assert.rejects(processWhopEvent(makeEvent(), deps), /42P18/);
  assert.equal(deps.project.payment, null);
  assert.equal(deps.processedEvents.size, 0);
  assert.equal(deps.processedPayments.size, 0);
  assert.deepEqual(deps.operations, []);

  const replay = await processWhopEvent(makeEvent(), deps);
  assert.equal(replay.kind, "updated");
  assert.equal(deps.project.payment.status, "paid");
  assert.equal(deps.processedEvents.has("evt_test_1"), true);
  assert.equal(deps.processedPayments.has("pay_test_1"), true);
  assert.deepEqual(deps.operations, ["payment-recorded", "event-completed"]);
});

test("unexpected webhook error logs safe reason/project and alerts Whop webhook failed while returning 500", async () => {
  const logs = [];
  const alerts = [];
  const rawBody = JSON.stringify(makeEvent());
  const handler = createWhopWebhookHandler({
    verifyWebhook: testVerifier,
    processEvent: async () => { throw new Error("NeonDbError code 42P18 WHOP_API_KEY=whop_TEST_SECRET"); },
    secretConfigured: true,
    failureAlert: async (...args) => alerts.push(args),
    logger: { error(...args) { logs.push(args); } },
  });
  const res = responseStub();
  await handler({ body: Buffer.from(rawBody), headers: signedHeaders(rawBody) }, res);

  assert.equal(res.statusCode, 500);
  assert.equal(logs[0][1].projectId, "TR-TEST-123");
  assert.equal(logs[0][1].paymentId, "pay_test_1");
  assert.match(logs[0][1].reason, /42P18/);
  assert.doesNotMatch(JSON.stringify(logs), /TEST_SECRET/);
  assert.equal(alerts[0][0], "Whop webhook failed");
  assert.match(alerts[0][1], /Payment ID: pay_test_1/);
  assert.match(alerts[0][1], /Project ID: TR-TEST-123/);
  assert.doesNotMatch(alerts[0][1], /TEST_SECRET/);
});

test("wrong plan is rejected and alerted without marking the event processed", async () => {
  const deps = makeDeps();
  const result = await processWhopEvent(makeEvent({ plan_id: "plan_wrong" }), deps);
  assert.equal(result.kind, "rejected-plan");
  assert.equal(deps.project.payment, null);
  assert.ok(deps.alerts.some(([title]) => title.includes("plan mismatch")));
  assert.equal(deps.processedEvents.size, 0);
});

test("missing metadata is rejected and alerted without marking the event processed", async () => {
  const deps = makeDeps();
  const result = await processWhopEvent(makeEvent({ metadata: {} }), deps);
  assert.equal(result.kind, "rejected-metadata");
  assert.equal(deps.project.payment, null);
  assert.ok(deps.alerts.some(([title]) => title.includes("missing project metadata")));
  assert.equal(deps.processedEvents.size, 0);
});
