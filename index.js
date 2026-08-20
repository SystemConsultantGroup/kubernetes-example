import { createServer } from "node:http";

const responseVariableNames = [
  "EXAMPLE_MESSAGE",
  "ENVIRONMENT",
  "INHERITED_VALUE",
  "OVERRIDDEN_VALUE",
  "PREVIEW_ONLY_VALUE",
];

export function createApplication(environment = process.env) {
  return createServer((request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;

    if (path === "/livez" || path === "/readyz") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("ok\n");
      return;
    }

    const variables = Object.fromEntries(
      responseVariableNames.map((name) => [name, environment[name] ?? null]),
    );
    const body = JSON.stringify(
      {
        message: environment.EXAMPLE_MESSAGE ?? "Hello from Kubernetes!",
        variables,
      },
      null,
      2,
    );

    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
    });
    response.end(`${body}\n`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? "8080");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer from 1 through 65535");
  }

  createApplication().listen(port, "0.0.0.0", () => {
    console.log(`Listening on port ${port}`);
  });
}
