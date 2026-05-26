# Duke Search Web

React, TypeScript, and Vite frontend for Duke Search. This client provides the browser interface for interacting with the Duke Search API, including retrieval-augmented chat features backed by the API service in the repository root.

## Tech Stack

- React 19
- TypeScript
- Vite
- ESLint
- assistant-ui and Vercel AI SDK packages
- nginx for the production container runtime

## Prerequisites

- Node.js compatible with the project dependencies.
- pnpm, preferably through Corepack.
- A running Duke Search API, usually at `http://localhost:3333` during local development.

From the repository root, install dependencies with:

```bash
pnpm install
```

If you work inside `web/` independently, install the frontend dependencies from this directory:

```bash
cd web
pnpm install
```

## Environment Configuration

Copy the frontend environment example before running the app locally:

```bash
cp .env.example .env
```

Available variables:

```env
VITE_API_URL=http://localhost:3333
```

`VITE_API_URL` must point to the Duke Search API. Vite exposes this value to the browser at build time, so rebuild the frontend when changing it for a deployed environment.

## Development

Start the API from the repository root first:

```bash
pnpm dev
```

Then start the web client from `web/`:

```bash
cd web
pnpm dev
```

Vite will print the local development URL, typically `http://localhost:5173`.

## Scripts

Run these commands from the `web/` directory:

| Command        | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| `pnpm dev`     | Start the Vite development server with hot module replacement.            |
| `pnpm build`   | Type-check the app and create a production build in `dist/`.              |
| `pnpm lint`    | Run ESLint against the frontend source.                                   |
| `pnpm ci`      | Run linting and the production build. Use this before submitting changes. |
| `pnpm preview` | Serve the production build locally for a final smoke test.                |

## Production Build

Create a production bundle with:

```bash
pnpm build
```

Preview the generated `dist/` output locally:

```bash
pnpm preview
```

## Docker

The frontend Dockerfile builds the app with Node and serves the static output with nginx.

Build the web image from the repository root:

```bash
docker build -t duke-search-web ./web
```

Pass a different API URL at build time when needed:

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:3333 \
  -t duke-search-web \
  ./web
```

Run the container locally:

```bash
docker run --rm -p 3000:80 duke-search-web
```

The web app will be available at `http://localhost:3000`.

For the full application stack, use Docker Compose from the repository root:

```bash
docker compose up --build
```

## Project Layout

```text
web/
├── src/                 # React application source
├── public/              # Static assets, if present
├── Dockerfile           # Build and nginx runtime image
├── nginx.conf           # nginx configuration for serving the SPA
├── package.json         # Frontend dependencies and scripts
├── vite.config.ts       # Vite configuration
└── tsconfig*.json       # TypeScript configuration
```

## Quality Checklist

Before opening a pull request that changes the web client, run:

```bash
pnpm ci
```

If your change affects container behavior, also verify the Docker build:

```bash
docker build --target checks -t duke-search-web-check ./web
```

## Related Documentation

- Root project README: [`../README.md`](../README.md)
- Frontend environment example: [`.env.example`](./.env.example)
- Web Dockerfile: [`Dockerfile`](./Dockerfile)
