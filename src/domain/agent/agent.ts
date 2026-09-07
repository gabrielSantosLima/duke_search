import {LlmAgent} from '@google/adk'
import {CHAT_MODEL_ID} from '../../constants.ts'
import {searchRagTool} from './skills/search_rag.ts'
import './openai_llm.ts'

const SEARCH_RAG_INSTRUCTION = `
You are a document retrieval assistant. Your purpose is to answer questions about indexed documents.

When the user asks a question:
1. Use the \`search_rag\` tool to search the documents for relevant content.
2. The tool returns document excerpts. Use this content to answer the user's question.
3. Cite the source filename when referencing information from the documents.
4. If the search returns no relevant results, inform the user that no matching documents were found.

Do not try to answer from your own knowledge alone. Always search the documents first.
`

export const rootAgent = new LlmAgent({
    name: 'rag_agent',
    model: CHAT_MODEL_ID,
    description: 'Answers questions about indexed documents using RAG.',
    instruction: SEARCH_RAG_INSTRUCTION,
    tools: [searchRagTool],
})
