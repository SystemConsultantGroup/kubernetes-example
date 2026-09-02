import assert from "node:assert/strict";
import test from "node:test";

import { createApplication } from "./index.js";

async function request(path, environment) {
  const server = createApplication(environment);

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

test("serves selected environment variables as HTML", async () => {
  const response = await request("/", {
    EXAMPLE_MESSAGE: "testing",
    ENVIRONMENT: "preview",
    INHERITED_VALUE: "from-testing",
    OVERRIDDEN_VALUE: "from-preview",
    PREVIEW_ONLY_VALUE: "preview-only",
    UNRELATED_SECRET: "hidden",
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("content-type"),
    "text/html; charset=utf-8",
  );
  const body = await response.text();
  assert.match(body, /<h1>testing<\/h1>/);
  assert.match(body, /<dt>ENVIRONMENT<\/dt><dd>preview<\/dd>/);
  assert.match(body, /<dt>PREVIEW_ONLY_VALUE<\/dt><dd>preview-only<\/dd>/);
  assert.doesNotMatch(body, /hidden/);
  assert.match(body, /<\/body>/);
});

test("uses defaults for missing environment variables", async () => {
  const response = await request("/", {});
  const body = await response.text();

  assert.match(body, /<h1>Hello from Kubernetes!<\/h1>/);
  assert.match(body, /<dt>EXAMPLE_MESSAGE<\/dt><dd>unset<\/dd>/);
  assert.match(body, /<dt>PREVIEW_ONLY_VALUE<\/dt><dd>unset<\/dd>/);
});

test("escapes environment variables for HTML", async () => {
  const response = await request("/", {
    EXAMPLE_MESSAGE: '<script>alert("unsafe")</script>',
  });

  assert.equal(
    await response.text().then((body) => body.includes("&lt;script&gt;")),
    true,
  );
});

test("serves health endpoints", async () => {
  for (const path of ["/livez", "/readyz"]) {
    const response = await request(path);

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "ok\n");
  }
});
