-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the table for your specialist knowledge
CREATE TABLE document_knowledge (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,                  -- The actual text chunk
    embedding VECTOR(768),                  -- Must match the embedding model dimension (e.g., google/embeddinggemma-300m)
    source_name VARCHAR(255),               -- e.g., "Manual_V1.pdf" or "Presentation.pptx"
    page_number INTEGER,                    -- Page or Slide number
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Add an index for fast similarity search (HNSW is generally best for RAG)
CREATE INDEX ON document_knowledge 
USING hnsw (embedding vector_cosine_ops);

-- 4. Migrate deploy: pnpm dlx prisma migrate deploy
-- 5. Update schema: pnpm dlx prisma db pull
