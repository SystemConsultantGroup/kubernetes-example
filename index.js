import { createServer } from "node:http";

const responseVariableNames = [
  "EXAMPLE_MESSAGE",
  "ENVIRONMENT",
  "INHERITED_VALUE",
  "OVERRIDDEN_VALUE",
  "PREVIEW_ONLY_VALUE",
];

function escapeHtml(value) {
  return String(value).replace(
    /[&<>\"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export function createApplication(environment = process.env) {
  return createServer((request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;

    if (path === "/livez" || path === "/readyz") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("ok\n");
      return;
    }

    const message = environment.EXAMPLE_MESSAGE ?? "Hello from Kubernetes!";
    const variables = responseVariableNames.map((name) => {
      const value = environment[name] ?? "unset";
      return `<dt>${name}</dt><dd>${escapeHtml(value)}</dd>`;
    });
    const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kubernetes Example</title>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(message)}</h1>
      <dl>
        ${variables.join("\n        ")}
      </dl>
    </main>
  </body>
</html>
`;

    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
    });
    response.end(body);
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
