import OpenAI from 'openai'

const SYSTEM_PROMPT = `
You are a FAQ chatbot. 
According the RAG CONTENT, answer the prompt of the user. 
If you don't know about it. Just say you don't know.

Answer following the template:

ANSWER = ...
FILENAME = ...
`

export class AskUseCase {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            baseURL: 'http://localhost:1234/v1',
            apiKey: 'openai',
        })
    }

    async execute(ragContent: string, prompt: string): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {role: 'system', content: `RAG CONTENT: ${ragContent}`},
                {role: 'user', content: prompt},
            ],
            model: 'gemma-4-e4b-it',
        })
        return (
            completion?.choices[0]?.message.content || 'No response available'
        )
    }
}
