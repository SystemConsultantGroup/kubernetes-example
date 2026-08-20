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

## Container image

The main-branch workflow tests the service and publishes an image to GitHub
Container Registry. It emits the immutable image digest for use in the
Kubernetes deployment lock.
