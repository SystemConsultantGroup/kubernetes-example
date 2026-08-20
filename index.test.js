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

test("serves selected environment variables", async () => {
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
    "application/json; charset=utf-8",
  );
  assert.deepEqual(await response.json(), {
    message: "testing",
    variables: {
      EXAMPLE_MESSAGE: "testing",
      ENVIRONMENT: "preview",
      INHERITED_VALUE: "from-testing",
      OVERRIDDEN_VALUE: "from-preview",
      PREVIEW_ONLY_VALUE: "preview-only",
    },
  });
});

test("uses defaults for missing environment variables", async () => {
  const response = await request("/", {});

  assert.deepEqual(await response.json(), {
    message: "Hello from Kubernetes!",
    variables: {
      EXAMPLE_MESSAGE: null,
      ENVIRONMENT: null,
      INHERITED_VALUE: null,
      OVERRIDDEN_VALUE: null,
      PREVIEW_ONLY_VALUE: null,
    },
  });
});

test("serves health endpoints", async () => {
  for (const path of ["/livez", "/readyz"]) {
    const response = await request(path);

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "ok\n");
  }
});
