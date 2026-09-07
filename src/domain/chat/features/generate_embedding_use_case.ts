import {pipeline} from '@huggingface/transformers'
import {EMBEDDING_MODEL_ID} from '../../../constants.ts'

const embedder = await pipeline('feature-extraction', EMBEDDING_MODEL_ID)

export class GenerateEmbeddingUseCase {
    async execute(text: string): Promise<number[]> {
        const output = await embedder(text, {
            pooling: 'mean',
            normalize: true,
        })
        return Array.from(output.data)
    }
}
