export const PORT = process.env.PORT || 3333
export const MODEL_BASE_URL = process.env.MODEL_BASE_URL
export const MODEL_API_KEY = process.env.MODEL_API_KEY

if (!MODEL_API_KEY) {
    throw Error('API key not registered.')
}

if (!MODEL_BASE_URL) {
    throw Error('Base URL not registered.')
}
