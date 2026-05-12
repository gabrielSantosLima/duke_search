import OpenAI from 'openai'

export class InvokeLLMUseCase {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            baseURL: 'http://localhost:1234/v1',
            apiKey: 'openai',
        })
    }

    async execute(prompt: string): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            messages: [{role: 'user', content: prompt}],
            model: 'gemma-4-e4b-it',
        })
        return (
            completion?.choices[0]?.message.content || 'No response available'
        )
    }
}
