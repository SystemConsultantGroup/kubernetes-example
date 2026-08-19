import { createServer } from "node:http";

export function createApplication() {
  return createServer((request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;

    if (path === "/livez" || path === "/readyz") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("ok\n");
      return;
    }

    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("Hello from Kubernetes!\n");
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
