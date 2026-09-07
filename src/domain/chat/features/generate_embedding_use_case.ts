import {OpenAIClient} from '../../openai/index.ts'
import {
    EMBEDDING_MODEL_ID,
    MODEL_API_KEY,
    MODEL_BASE_URL,
} from '../../../constants.ts'

export class GenerateEmbeddingUseCase {
    private openai: OpenAIClient

    constructor() {
        this.openai = new OpenAIClient({
            baseURL: MODEL_BASE_URL,
            apiKey: MODEL_API_KEY,
        })
    }

    async execute(text: string): Promise<number[]> {
        const response = await this.openai.createEmbedding({
            input: text,
            model: EMBEDDING_MODEL_ID,
        })
        const embedding = response.data[0]?.embedding
        if (!embedding) {
            throw Error('No embedding returned.')
        }
        return embedding
    }
}
