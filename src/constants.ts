export const PORT = process.env.PORT || 3333

const modelBaseUrl = process.env.MODEL_BASE_URL
const modelApiKey = process.env.MODEL_API_KEY
const chatModelId = process.env.CHAT_MODEL_ID
const embeddingModelId = process.env.EMBEDDING_MODEL_ID

if (!modelApiKey) {
    throw Error('API key not registered.')
}

if (!modelBaseUrl) {
    throw Error('Base URL not registered.')
}

if (!chatModelId) {
    throw Error('Chat model ID not registered.')
}

if (!embeddingModelId) {
    throw Error('Embedding model ID not registered.')
}

export const MODEL_BASE_URL = modelBaseUrl as string
export const MODEL_API_KEY = modelApiKey as string
export const CHAT_MODEL_ID = chatModelId as string
export const EMBEDDING_MODEL_ID = embeddingModelId as string
