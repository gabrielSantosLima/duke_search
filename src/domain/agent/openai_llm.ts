/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import {BaseLlm, LLMRegistry} from '@google/adk'
import {OpenAIClient} from '../openai/index.ts'
import type {
    ChatMessage,
    FunctionDeclaration,
} from '../openai/index.ts'
import {
    CHAT_MODEL_ID,
    MODEL_API_KEY,
    MODEL_BASE_URL,
} from '../../constants.ts'

const PART_FINISH_REASON_MAP: Record<string, string> = {
    stop: 'STOP',
    tool_calls: 'STOP',
    length: 'MAX_TOKENS',
    content_filter: 'SAFETY',
}

const client = new OpenAIClient({
    baseURL: MODEL_BASE_URL,
    apiKey: MODEL_API_KEY,
})

export class OpenAIClientLlm extends BaseLlm {
    static override supportedModels = [/deepseek-ai\/.*/]

    async *generateContentAsync(
        llmRequest: any,
        _stream = false,
        _abortSignal?: AbortSignal,
    ): AsyncGenerator<any> {
        this.maybeAppendUserContent(llmRequest)

        const messages = this.buildMessages(llmRequest)
        const tools = this.buildTools(llmRequest)

        const response = await client.createChatCompletion({
            model: CHAT_MODEL_ID,
            messages,
            tools: tools.length > 0 ? tools : undefined,
        })

        const choice = response.choices[0]
        if (!choice) {
            yield {
                errorCode: 'UNKNOWN_ERROR',
                errorMessage: 'No response from model',
            }
            return
        }

        const parts: unknown[] = []

        if (choice.message.content) {
            parts.push({text: choice.message.content})
        }

        if (choice.message.tool_calls) {
            for (const tc of choice.message.tool_calls) {
                parts.push({
                    functionCall: {
                        id: tc.id,
                        name: tc.function.name,
                        args: JSON.parse(tc.function.arguments),
                    },
                })
            }
        }

        yield {
            content: {parts, role: 'model'},
            finishReason:
                PART_FINISH_REASON_MAP[choice.finish_reason] || 'STOP',
            usageMetadata: {
                promptTokenCount: response.usage.prompt_tokens,
                candidatesTokenCount: response.usage.completion_tokens,
            },
        }
    }

    async connect(_llmRequest: any): Promise<any> {
        return {
            connect: async function* () {
                yield {}
            },
        }
    }

    private buildMessages(llmRequest: any): ChatMessage[] {
        const messages: ChatMessage[] = []

        if (llmRequest.config?.systemInstruction) {
            messages.push({
                role: 'system',
                content: llmRequest.config.systemInstruction,
            })
        }

        if (llmRequest.contents) {
            for (const content of llmRequest.contents) {
                const role = content.role === 'model' ? 'assistant' : content.role

                const parts = content.parts || []
                const textParts = parts
                    .filter((p: any) => p.text)
                    .map((p: any) => p.text)
                    .join('')

                const functionCallParts = parts.filter((p: any) => p.functionCall)
                const functionResponseParts = parts.filter(
                    (p: any) => p.functionResponse,
                )

                if (functionCallParts.length > 0) {
                    for (const part of functionCallParts) {
                        const fc = part.functionCall
                        messages.push({
                            role: 'assistant',
                            content: null,
                            tool_calls: [
                                {
                                    id: fc.id || fc.name,
                                    type: 'function',
                                    function: {
                                        name: fc.name,
                                        arguments: JSON.stringify(fc.args),
                                    },
                                },
                            ],
                        })
                    }
                } else if (functionResponseParts.length > 0) {
                    for (const part of functionResponseParts) {
                        const fr = part.functionResponse
                        messages.push({
                            role: 'tool',
                            tool_call_id: fr.id || fr.name,
                            content: JSON.stringify(fr.response),
                        })
                    }
                } else if (textParts) {
                    messages.push({role, content: textParts} as ChatMessage)
                }
            }
        }

        return messages
    }

    private buildTools(
        llmRequest: any,
    ): {type: 'function'; function: FunctionDeclaration}[] {
        const tools: {type: 'function'; function: FunctionDeclaration}[] = []

        if (llmRequest.config?.tools) {
            for (const toolGroup of llmRequest.config.tools) {
                const decls = toolGroup.functionDeclarations
                if (decls) {
                    for (const decl of decls) {
                        tools.push({
                            type: 'function',
                            function: {
                                name: decl.name,
                                description: decl.description || '',
                                parameters:
                                    (decl.parameters as Record<string, unknown>) ||
                                    {},
                            },
                        })
                    }
                }
            }
        }

        return tools
    }
}

LLMRegistry.register(OpenAIClientLlm)
