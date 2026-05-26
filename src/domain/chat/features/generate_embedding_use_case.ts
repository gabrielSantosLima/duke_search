import {pipeline} from '@huggingface/transformers'

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

export class GenerateEmbeddingUseCase {
    async execute(text: string): Promise<number[]> {
        const output = await embedder(text, {
            pooling: 'mean',
            normalize: true,
        })
        return Array.from(output.data)
    }
}
