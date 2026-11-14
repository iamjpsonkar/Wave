# Docker deployment

Wave can be built and served as a static web application in Docker. This is a **web-hosting option**, not a server-side workspace engine: the current app still runs in each user's browser and uses the browser File System Access API to access a folder the user explicitly selects.

## What this deployment provides

- Multi-stage image: Node 22 builds the Vite app; an unprivileged Nginx image serves the generated static files.
- Docker Compose for a repeatable local or self-hosted deployment.
- Read-only container filesystem, dropped Linux capabilities, no-new-privileges and a writable temporary filesystem only.
- SPA route fallback, immutable caching for hashed assets, revalidation for the app shell, basic browser security headers and an HTTP health check.
- No database, API, document upload endpoint, account system or shared workspace is introduced.

## Requirements

- Docker Engine with Compose v2 (`docker compose`).
- A supported Chromium-based browser for the intended folder-selection workflow.
- HTTPS for access from another device or hostname. Browsers generally restrict powerful filesystem APIs to secure contexts; localhost is treated specially for development.

## Start with Compose

From the repository root:

```bash
docker compose up --build -d
docker compose ps
```

Open [http://localhost:8080](http://localhost:8080). Change the host port without editing the Compose file:

```bash
WAVE_PORT=8090 docker compose up --build -d
```

Stop the container:

```bash
docker compose down
```

The container does not mount a host directory because Wave does not read its workspace from the container filesystem. Select a folder from the browser UI on the client device. The browser's permission and filesystem support still apply.

## Build and run without Compose

```bash
docker build -t wave:local .
docker run --rm --name wave -p 8080:8080 --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --cap-drop ALL --security-opt no-new-privileges wave:local
```

## Reverse proxy and HTTPS

For remote access, put the container behind a trusted reverse proxy that terminates TLS. Configure the proxy to forward requests to the container's port 8080. Do not expose an unencrypted public endpoint if users may access it over a network. Keep the proxy and container updated, restrict who can reach the service, and configure your own domain, certificates, firewall and backups.

The included Nginx configuration deliberately serves only static files. It does not configure TLS, authentication, multi-user access or a remote document store.

## Browser and storage boundaries

- Each browser user selects and grants access to a directory on their own device.
- Saved Markdown files and assets remain in that selected directory, not in the Docker container.
- Recent workspace handles and temporary unsaved recovery drafts use browser-local IndexedDB.
- Clearing browser site data can remove recovery drafts and remembered handles.
- The container's health check verifies that the static app responds; it does not test filesystem permission, workspace writes, backup integrity or browser compatibility.
- A container restart or image replacement does not back up a user's selected workspace. Use Wave's workspace backup feature and keep an independent copy.

## Production notes

- Pin base images to approved versions or digests in a controlled release pipeline.
- Scan and update base images regularly.
- Serve through HTTPS and an appropriately configured reverse proxy for non-local access.
- Do not mistake static hosting for collaboration or server-side persistence. Those require a separately designed API, identity/authorization, storage, migrations, encryption, backup and operational model. They remain future product work.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Page loads but folder selection is unavailable | Use a supported Chromium browser and a secure context; check browser permission support |
| Browser shows a stale app after deployment | Reload; the app shell is revalidated and hashed assets are immutable |
| Container is unhealthy | Check `docker compose logs wave` and confirm port 8080 is reachable inside the container |
| Remote browser cannot access a local folder | This is expected: browser folder access is to the remote user's own device, not the Docker host |
