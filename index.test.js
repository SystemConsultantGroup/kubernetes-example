import assert from "node:assert/strict";
import test from "node:test";

import { createApplication } from "./index.js";

async function request(path) {
  const server = createApplication();

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${path}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test("serves the example page", async () => {
  const response = await request("/");

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "Hello from Kubernetes!\n");
});

test("serves health endpoints", async () => {
  for (const path of ["/livez", "/readyz"]) {
    const response = await request(path);

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "ok\n");
  }
});
