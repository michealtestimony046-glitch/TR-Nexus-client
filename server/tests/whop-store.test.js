import test from "node:test";
import assert from "node:assert/strict";
import { createWhopEventStore, createWhopPaymentRecorder } from "../store.js";

function makeSqlMock(onQuery = () => []) {
  const statements = [];
  const sql = async (strings, ...values) => {
    let text = "";
    for (let index = 0; index < strings.length; index += 1) {
      text += strings[index];
      if (index < values.length) text += `$${index + 1}`;
    }
    const statement = { text, values };
    statements.push(statement);
    return onQuery(statement) || [];
  };
  return { getSql: () => sql, statements };
}

function assertEveryParameterIsCast(statements) {
  for (const { text } of statements) {
    for (const match of text.matchAll(/\$(\d+)/g)) {
      const suffix = text.slice(match.index + match[0].length);
      assert.match(suffix, /^\s*::(?:text|jsonb|timestamptz|numeric|boolean)\b/, `Uncast SQL parameter in: ${text}`);
    }
  }
}

test("recordWhopPayment casts every parameter even when free-order fields are null", async () => {
  const project = { id: "TR-TEST-123", payment: null };
  const sql = makeSqlMock(({ text }) => text.includes("UPDATE projects") ? [project] : []);
  const recordPayment = createWhopPaymentRecorder({
    getSql: sql.getSql,
    findProject: async () => project,
  });
  const payment = {
    amount: 0,
    total: 0,
    usd_total: 0,
    subtotal: 49,
    currency: "USD",
    payment_method: null,
    payment_method_type: null,
    card_brand: null,
    card_last4: null,
    card_exp_month: null,
    card_exp_year: null,
    promo_code: "trlaunchtest100",
    paid_at: "2026-10-13T00:00:00.000Z",
    whop_payment_id: "pay_test_free_1",
  };

  const result = await recordPayment("TR-TEST-123", payment, "evt_test_free_1");

  assert.equal(result.kind, "updated");
  const update = sql.statements.find(({ text }) => text.includes("UPDATE projects"));
  assert.ok(update);
  assertEveryParameterIsCast([update]);
  assert.deepEqual(JSON.parse(update.values[0]), payment);
});

test("all Whop event-store query parameters are explicitly typed and event IDs persist only on completion", async () => {
  const processed = new Map();
  const recordedPayments = new Set();
  const sql = makeSqlMock(({ text, values }) => {
    if (text.includes("SELECT processed.event_id") || text.includes("SELECT event_id")) {
      const eventId = values[0];
      const paymentId = values[1];
      const match = [...processed.values()].find((entry) =>
        entry.processed && (entry.eventId === eventId || (paymentId && entry.paymentId === paymentId))
      );
      if (text.includes("AND EXISTS") && !recordedPayments.has(paymentId)) return [];
      return match ? [{ event_id: match.eventId }] : [];
    }
    if (text.includes("INSERT INTO whop_processed_events")) {
      if (!processed.has(values[0])) {
        processed.set(values[0], { eventId: values[0], paymentId: values[1], eventType: values[2], processed: true });
      }
    }
    return [];
  });
  const store = createWhopEventStore(sql.getSql);

  assert.equal(await store.claimWhopEvent("evt_test_1", "pay_test_1", "payment.succeeded"), true);
  assert.equal(processed.size, 0, "claim must not insert a success event before payment recording");
  assert.equal(sql.statements.some(({ text }) => text.includes("INSERT INTO whop_processed_events")), false);

  recordedPayments.add("pay_test_1"); // The project update succeeded before completion is called.
  await store.completeWhopEvent("evt_test_1", "pay_test_1", "payment.succeeded");
  assert.equal(processed.size, 1);
  assert.equal(await store.claimWhopEvent("evt_test_1", "pay_test_1", "payment.succeeded"), false);
  assert.equal(await store.claimWhopEvent("evt_test_2", "pay_test_1", "payment.succeeded"), false);

  await store.releaseWhopEvent("evt_test_3");
  assert.equal(await store.hasProcessedWhopEvent("evt_test_1"), true);

  processed.set("evt_legacy_failed", {
    eventId: "evt_legacy_failed",
    paymentId: "pay_legacy_failed",
    eventType: "payment.succeeded",
    processed: true,
  });
  assert.equal(
    await store.claimWhopEvent("evt_legacy_failed", "pay_legacy_failed", "payment.succeeded"),
    true,
    "a legacy marker without a matching paid project record must not block replay"
  );
  assertEveryParameterIsCast(sql.statements);
});
