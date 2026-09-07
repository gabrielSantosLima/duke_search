import type {
    ChatCompletion,
    ChatMessage,
    EmbeddingResponse,
    FunctionDeclaration,
    ModelList,
} from './types.ts'

interface OpenAIClientOptions {
    baseURL: string
    apiKey: string
}

export class OpenAIClient {
    private readonly baseURL: string
    private readonly apiKey: string

    constructor({baseURL, apiKey}: OpenAIClientOptions) {
        this.baseURL = baseURL.replace(/\/+$/, '')
        this.apiKey = apiKey
    }

    private async request<T>(
        path: string,
        options: RequestInit = {},
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
        })

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '')
            throw new Error(
                `OpenAI request failed (${response.status} ${response.statusText}): ${errorBody}`,
            )
        }

        return (await response.json()) as T
    }

    async createChatCompletion(params: {
        messages: ChatMessage[]
        model: string
        tools?: {type: 'function'; function: FunctionDeclaration}[]
    }): Promise<ChatCompletion> {
        return this.request<ChatCompletion>('/chat/completions', {
            method: 'POST',
            body: JSON.stringify(params),
        })
    }

    async listModels(): Promise<ModelList> {
        return this.request<ModelList>('/models')
    }

    async createEmbedding(params: {
        input: string
        model: string
    }): Promise<EmbeddingResponse> {
        return this.request<EmbeddingResponse>('/embeddings', {
            method: 'POST',
            body: JSON.stringify(params),
        })
    }
}
