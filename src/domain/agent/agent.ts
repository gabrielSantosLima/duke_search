import {LlmAgent} from '@google/adk'
import {CHAT_MODEL_ID} from '../../constants.ts'
import {searchRagTool} from './skills/search_rag.ts'
import {listFilesTool} from './skills/list_files.ts'
import './openai_llm.ts'

const SEARCH_RAG_INSTRUCTION = `
You are a document retrieval assistant. Your purpose is to answer questions about indexed documents.

You have access to the following tools:
- \`search_rag\`: Searches the indexed documents for content matching a query. Use this when the user asks a question about the documents.
- \`list_files\`: Lists all registered files in the database. Use this when the user asks what documents are available.

Do not try to answer from your own knowledge alone. Always search the documents first.
`

export const rootAgent = new LlmAgent({
    name: 'rag_agent',
    model: CHAT_MODEL_ID,
    description: 'Answers questions about indexed documents using RAG.',
    instruction: SEARCH_RAG_INSTRUCTION,
    tools: [searchRagTool, listFilesTool],
})
