# Kubernetes Example

A minimal Node.js HTTP service for exercising the managed application platform.

## Local use

```bash
pnpm test
pnpm start
```

The service listens on port `8080` by default and exposes `/livez` and
`/readyz` health endpoints. Other requests return JSON containing the selected
`EXAMPLE_MESSAGE`, `ENVIRONMENT`, `INHERITED_VALUE`, `OVERRIDDEN_VALUE`, and
`PREVIEW_ONLY_VALUE` environment variables. Other process environment values
are never included.

## Container delivery

The container workflow delegates image publication and instance updates to the
reusable Kubernetes delivery workflow. A push to `main` updates production, a
push to `testing` updates testing, and a same-repository pull request creates or
updates its preview. Closing the pull request removes that preview.

Images are published to GitHub Container Registry and deployed only by immutable
digest. The workflow needs the `KUBERNETES_APP_ID` and
`KUBERNETES_APP_PRIVATE_KEY` repository secrets to dispatch the restricted
Kubernetes workflow.
