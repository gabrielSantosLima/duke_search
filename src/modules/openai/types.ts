export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatCompletionMessage {
    role: ChatRole
    content: string
}

export interface ChatCompletion {
    choices: {
        message: {
            content: string | null
        }
    }[]
}

export interface ModelList {
    data: {
        id: string
    }[]
}

export interface EmbeddingResponse {
    data: {
        embedding: number[]
    }[]
}
