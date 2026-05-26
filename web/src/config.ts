const DEFAULT_API_URL = 'http://localhost:3333'

export const config = {
    apiUrl: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
} as const
