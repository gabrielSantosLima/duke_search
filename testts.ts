import {
    BaseLlm,
    BaseLlmConnection,
    FunctionTool,
    LlmAgent,
    LlmRequest,
    LlmResponse,
} from '@google/adk'
import {z} from 'zod'
import OpenAI from 'openai'

const getCurrentTime = new FunctionTool({
    name: 'get_current_time',
    description: 'Returns the current time in a specified city.',
    parameters: z.object({
        city: z
            .string()
            .describe(
                'The name of the city for which to retrieve the current time.',
            ),
    }),
    execute: ({city}) => {
        console.log('getCurrentTime -- ', city)
        return {
            status: 'success',
            report: `The current time in ${city} is 10:30 AM`,
        }
    },
})

class OpenAILLM extends BaseLlm {
    private openai: OpenAI

    constructor() {
        super({model: 'localmodel'})
        this.openai = new OpenAI({
            baseURL: 'http://localhost:1234/v1',
            apiKey: 'openai',
        })
    }

    async *generateContentAsync(
        llmRequest: LlmRequest,
        stream: boolean = false,
        abortSignal?: AbortSignal,
    ): AsyncGenerator<LlmResponse, void> {
        // 1. Prepare the messages from llmRequest
        console.log(llmRequest)
        const messages = llmRequest.contents.map(m => ({
            role: 'user' as 'user' | 'assistant' | 'system',
            content: m.parts?.map(a => a.text).join(' ') || '',
        }))

        messages.push({
            role: 'system' as 'user' | 'assistant' | 'system',
            content: JSON.stringify(llmRequest.config),
        })

        // 2. Call OpenAI with the stream flag
        const response = await this.openai.chat.completions.create(
            {
                model: llmRequest.model || 'gemma-4-e4b-it',
                messages: messages,
                stream: stream,
            },
            {signal: abortSignal},
        )

        // 3. Handle Streaming Response
        if (
            (stream && response instanceof ReadableStream) ||
            (response as any)[Symbol.asyncIterator]
        ) {
            for await (const chunk of response as any) {
                const content = chunk.choices[0]?.delta?.content || ''
                if (content) {
                    yield {
                        content: content,
                        // You can map additional fields like tool calls here if needed
                    }
                }
            }
        }
        // 4. Handle Static Response
        else {
            const result = response as OpenAI.Chat.ChatCompletion
            yield {
                content: {
                    parts: [
                        {
                            text: result?.choices[0]?.message.content || '',
                        },
                    ],
                },
            }
        }
    }
    connect(llmRequest: LlmRequest): Promise<BaseLlmConnection> {
        throw new Error('No implemented')
    }
}

// 2. Initialize the Agent
export const rootAgent = new LlmAgent({
    name: 'LocalAssistant',
    description: 'An agent running entirely on my local machine.',
    tools: [getCurrentTime],
    model: new OpenAILLM(),
    instruction:
        'You are a helpful assitant. You have to consult the current time if the user requests. Else, return the word: "chuleta"',
})

// Note: If the TS library strictly enforces Vertex/Google AI,
// you may need to use a proxy or a "LiteLLM" style bridge
// if available for JS/TS.
