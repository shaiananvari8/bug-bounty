import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";

async function withServer(run) {
  const app = createApp();
  const server = app.listen(0);

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function postJson(baseUrl, payload) {
  return fetch(`${baseUrl}/api/notifications`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

test("POST /api/notifications rejects missing or blank required fields", async () => {
  await withServer(async (baseUrl) => {
    const missing = await postJson(baseUrl, {
      userId: "user_1",
      body: "Build finished"
    });
    const missingPayload = await missing.json();

    assert.equal(missing.status, 400);
    assert.deepEqual(missingPayload, {
      success: false,
      message: "Invalid notification payload"
    });

    const blank = await postJson(baseUrl, {
      userId: "user_1",
      title: "   ",
      body: "Build finished"
    });
    const blankPayload = await blank.json();

    assert.equal(blank.status, 400);
    assert.deepEqual(blankPayload, {
      success: false,
      message: "Invalid notification payload"
    });
  });
});

test("POST /api/notifications preserves server-owned id and read defaults", async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, {
      id: "caller_id",
      read: true,
      userId: "user_2",
      title: "Deployment complete",
      body: "The production deploy finished."
    });
    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.success, true);
    assert.match(payload.data.id, /^ntf_\d+$/);
    assert.notEqual(payload.data.id, "caller_id");
    assert.equal(payload.data.read, false);
    assert.equal(payload.data.userId, "user_2");
    assert.equal(payload.data.title, "Deployment complete");
    assert.equal(payload.data.body, "The production deploy finished.");
    assert.equal(Object.hasOwn(payload.data, "extra"), false);
  });
});
