export type ChatRole = 'system' | 'user' | 'assistant' | 'tool'

export interface ChatCompletionMessage {
    role: ChatRole
    content: string | null
}

export interface ToolCall {
    id: string
    type: 'function'
    function: {
        name: string
        arguments: string
    }
}

export interface AssistantMessage extends ChatCompletionMessage {
    role: 'assistant'
    tool_calls?: ToolCall[]
}

export interface ToolResultMessage extends ChatCompletionMessage {
    role: 'tool'
    tool_call_id: string
}

export type ChatMessage = ChatCompletionMessage | AssistantMessage | ToolResultMessage

export interface FunctionDeclaration {
    name: string
    description?: string
    parameters?: Record<string, unknown>
}

export interface ChatCompletion {
    choices: {
        message: {
            content: string | null
            tool_calls?: ToolCall[]
        }
        finish_reason: string
    }[]
    usage: {
        prompt_tokens: number
        completion_tokens: number
    }
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
