# Duke Search

Duke Search is a TypeScript/Express API for document upload, embedding generation, model discovery, and retrieval-augmented chat answers. It also includes a Vite/React web client served in production with nginx.

The API is designed to work with:

- PostgreSQL with `pgvector` for vector search storage.
- OpenAI-compatible model servers for chat/model APIs.
- Hugging Face Transformers for local text embeddings.

## Available API Features

### Chat and RAG

- `POST /v1/chat/completions`
    - Accepts a JSON body with `message.content`.
    - Runs retrieval-augmented generation over indexed content.
    - Returns an answer payload.

Example:

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"message":{"content":"What is Duke Search?"}}'
```

### Model discovery

- `GET /v1/models`
    - Proxies/list models from the configured OpenAI-compatible API.

Example:

```bash
curl http://localhost:3333/v1/models
```

### Embeddings

- `POST /v1/embeddings`
    - Accepts `input` as a string or string array.
    - Generates embeddings with the default local model `Xenova/all-MiniLM-L6-v2`.
    - Returns an OpenAI-style embeddings response.

Example:

```bash
curl -X POST http://localhost:3333/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":["hello world","semantic search"]}'
```

### Documents

- `POST /documents`
    - Uploads up to 10 files using multipart form-data under the `files` field.
    - Returns metadata and a static URL for each uploaded file.
- `GET /documents`
    - Lists uploaded file names from the local upload directory.
- `GET /static/:filename`
    - Serves uploaded files from the local upload directory.

Example upload:

```bash
curl -X POST http://localhost:3333/documents \
  -F "files=@./README.md"
```

## Tech Stack

- API: Node.js, TypeScript, Express, Prisma, PostgreSQL, pgvector.
- AI integrations: OpenAI-compatible client and `@huggingface/transformers`.
- Web: React, TypeScript, Vite.
- Containers: Node Alpine build stages and nginx Alpine web runtime.
- Package manager: pnpm.

## Development Setup

### Prerequisites

- Node.js compatible with the configured dependencies.
- pnpm `10.33.2` or Corepack enabled.
- Docker and Docker Compose.
- An OpenAI-compatible inference server, if you want to use chat/model endpoints locally.

### 1. Clone the repository

```bash
git clone https://github.com/gabrielSantosLima/duke_search.git
cd duke_search
```

### 2. Install dependencies

```bash
pnpm install
```

For the web project, run commands inside `web/` when working on the client:

```bash
cd web
pnpm install
```

### 3. Configure environment variables

Copy the root API environment example:

```bash
cp .env.example .env
```

Important API variables:

```env
PORT=3333
DATABASE_USER=user
DATABASE_PASSWORD=password1234
DATABASE_DB=randomdb
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_URL=postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?schema=public
MODEL_BASE_URL=http://localhost:1234/v1
MODEL_API_KEY=your-api-key
```

Copy the web environment example when running the client locally:

```bash
cp web/.env.example web/.env
```

Web variable:

```env
VITE_API_URL=http://localhost:3333
```

### 4. Start the development database

Use the database initialization script to start the PostgreSQL/pgvector and Adminer containers, wait until the database is ready, apply Prisma migrations, and generate the Prisma client:

```bash
bash tools/initialize-db.sh
```

The script expects `.env` to exist in the repository root. If needed, create it first:

```bash
cp .env.example .env
```

Default local services:

- PostgreSQL/pgvector: `localhost:5432`
- Adminer: `http://localhost:8080`

Adminer login values come from `.env`:

- System: `PostgreSQL`
- Server: `dukedb`
- Username: `DATABASE_USER`
- Password: `DATABASE_PASSWORD`
- Database: `DATABASE_DB`

If the database takes longer than the default 60 seconds to become ready, increase the wait timeout:

```bash
WAIT_TIMEOUT_SECONDS=120 bash tools/initialize-db.sh
```

### 5. Run the API in development

```bash
pnpm dev
```

The API listens on `http://localhost:3333` by default.

### 6. Run the web client in development

```bash
cd web
pnpm dev
```

### 7. Run checks

API:

```bash
pnpm run ci
```

Web:

```bash
cd web
pnpm run ci
```

## Running with Docker Compose

Build and start the full stack:

```bash
docker compose up --build
```

Default ports:

- API: `http://localhost:3333`
- Web: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Adminer: `http://localhost:8080`

The Docker builds run CI/lint checks during the build stages.

## Project Structure

```text
.
├── src/                    # API source code
│   ├── domain/chat/        # Chat, models, embeddings, and RAG routes/features
│   └── domain/document/    # Document upload/list/static serving routes
├── prisma/                 # Prisma schema, migrations, and seeds
├── db/                     # Database initialization scripts
├── tools/                  # Utility scripts
├── web/                    # Vite/React web client
├── Dockerfile              # API container definition
├── web/Dockerfile          # Web build + nginx runtime container definition
└── docker-compose.yml      # Local multi-container setup
```

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Create a focused branch from the current base branch.
2. Keep changes small and scoped to one feature or fix.
3. Follow the existing TypeScript and domain structure under `src/domain`.
4. Add or update documentation when behavior, setup, or endpoints change.
5. Run checks before opening a pull request:

    ```bash
    pnpm run ci
    cd web && pnpm run ci
    docker compose config --quiet
    ```

6. For container-related changes, verify the relevant Docker build stage:

    ```bash
    docker build --target checks -t duke-search-api-check .
    docker build --target checks -t duke-search-web-check ./web
    ```

7. Open a pull request with a clear description of the problem, solution, and verification performed.

## License

This project is licensed under the Apache License, Version 2.0. See [`LICENSE`](./LICENSE) for the full license text.
