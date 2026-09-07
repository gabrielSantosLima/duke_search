import {OpenAIClient} from '../../../modules/openai/index.ts'
import {
    CHAT_MODEL_ID,
    MODEL_API_KEY,
    MODEL_BASE_URL,
} from '../../../constants.ts'

const SYSTEM_PROMPT = `
You are a FAQ chatbot. 
According the RAG CONTENT, answer the prompt of the user. 
If you don't know about it. Just say you don't know.

Answer following the template:

ANSWER = ...
FILENAME = ...
`

export class AskUseCase {
    private openai: OpenAIClient

    constructor() {
        this.openai = new OpenAIClient({
            baseURL: MODEL_BASE_URL,
            apiKey: MODEL_API_KEY,
        })
    }

    async execute(ragContent: string, prompt: string): Promise<string> {
        const completion = await this.openai.createChatCompletion({
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {role: 'system', content: `RAG CONTENT: ${ragContent}`},
                {role: 'user', content: prompt},
            ],
            model: CHAT_MODEL_ID,
        })
        return (
            completion?.choices[0]?.message.content || 'No response available'
        )
    }
}
