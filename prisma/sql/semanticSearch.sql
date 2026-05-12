SELECT id, content, embedding, source_name, page_number
FROM "document_knowledge"
ORDER BY "embedding" <=> $1
LIMIT 5;
