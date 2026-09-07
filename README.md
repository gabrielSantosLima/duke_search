# Duke Search

A TypeScript/Express API for document upload, semantic search, and retrieval-augmented chat using an ADK agent with OpenAI-compatible models.

- PostgreSQL with pgvector for vector search
- OpenAI-compatible model servers (DeepInfra, LM Studio, etc.)
- ADK agent with custom tool skills (search, file listing)

## API Endpoints

### Chat / RAG

`POST /v1/chat/completions`

```bash
curl -X POST http://localhost:3333/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"message":{"content":"What documents are available?"}}'
```

Runs the ADK agent which uses the `search_rag` and `list_files` tools to answer questions about indexed documents.

### Models

`GET /v1/models`

Lists models from the configured OpenAI-compatible API.

### Embeddings

`POST /v1/embeddings`

Generates embeddings using the configured embedding model. Accepts `input` as a string or string array.

```bash
curl -X POST http://localhost:3333/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":["hello world","semantic search"]}'
```

### Documents

- `POST /documents` -- Upload up to 10 `.md`, `.markdown`, or `.txt` files.
- `GET /documents` -- List uploaded files.
- `GET /static/:filename` -- Serve uploaded files.

```bash
curl -X POST http://localhost:3333/documents \
  -F "files=@./README.md"
```

## Tech Stack

Node.js, TypeScript, Express, Prisma, PostgreSQL + pgvector, ADK (Agent Development Kit), pnpm.

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker and Docker Compose
- An OpenAI-compatible inference server (e.g., DeepInfra, LM Studio)

### Setup

```bash
git clone https://github.com/gabrielSantosLima/duke_search.git
cd duke_search
pnpm install
cp .env.example .env   # edit with your API keys and model IDs
bash tools/initialize-db.sh   # starts DB, applies migrations
pnpm dev               # starts the API on http://localhost:3333
```

### Run checks

```bash
pnpm run ci
```

### Run tests

```bash
pnpm test
```

## Project Structure

```
src/
  domain/
    agent/       # ADK agent, custom LLM, tool skills
    chat/        # Chat, models, embeddings, RAG use cases
    document/    # Document upload and registration
    openai/      # OpenAI-compatible HTTP client
prisma/          # Schema, migrations, typed SQL
db/              # Database init scripts
tools/           # Utility scripts
```

## License

Apache License, Version 2.0. See [LICENSE](./LICENSE).
