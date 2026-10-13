import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

test("production API starts with the complete route module graph", { timeout: 15_000 }, async () => {
  const child = spawn(process.execPath, ["server/index.js"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "0",
      APP_URL: "",
      DATABASE_URL: "",
      RESEND_API_KEY: "re_test_startup_smoke_only",
      WHOP_API_KEY: "",
      WHOP_COMPANY_ID: "",
      WHOP_PLAN_IDS: "",
      WHOP_WEBHOOK_SECRET: "",
      WHOP_API_BASE_URL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  const startup = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`API did not finish startup. Output:\n${output}`)), 10_000);
    child.stdout.setEncoding("utf8").on("data", (chunk) => {
      output += chunk;
      if (output.includes("[startup] Whop configuration:") && output.includes("Operational Systems Online")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.stderr.setEncoding("utf8").on("data", (chunk) => {
      output += chunk;
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      reject(new Error(`API exited before startup (code=${code}, signal=${signal}). Output:\n${output}`));
    });
  });

  try {
    await startup;
    assert.match(output, /Operational Systems Online/);
    assert.match(
      output,
      /\[startup\] Whop configuration: WHOP_API_KEY=missing WHOP_COMPANY_ID=missing WHOP_PLAN_IDS=missing WHOP_WEBHOOK_SECRET=missing/
    );
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await once(child, "exit");
    }
  }
});
