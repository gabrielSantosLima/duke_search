import * as fs from 'fs/promises'
import {PrismaClient} from '../../../../generated/prisma/client.ts'
import {GenerateEmbeddingUseCase} from '../../chat/features/generate_embedding_use_case.ts'

export type DatasetDocumentInput = {
    path: string
    sourceName: string
    localFilename: string
}

export type DatasetRegistrationResult = {
    sourceName: string
    localFilename: string
    chunks: number
}

const CHUNK_SIZE = 500

export class RegisterDocumentInDatasetUseCase {
    constructor(
        private prisma: PrismaClient,
        private generateEmbeddingUseCase: GenerateEmbeddingUseCase,
    ) {}

    async execute(
        documents: DatasetDocumentInput[],
    ): Promise<DatasetRegistrationResult[]> {
        const results: DatasetRegistrationResult[] = []

        for (const document of documents) {
            const content = await fs.readFile(document.path, 'utf-8')
            const chunks = this.chunkContent(content)

            for (const chunk of chunks) {
                const embedding =
                    await this.generateEmbeddingUseCase.execute(chunk)
                const vector = `[${embedding.join(',')}]`

                await this.prisma.$executeRaw`
                    INSERT INTO "document_knowledge" (content, embedding, source_name, local_filename, page_number)
                    VALUES (${chunk}, ${vector}::vector, ${document.sourceName}, ${document.localFilename}, 0)
                `
            }

            results.push({
                sourceName: document.sourceName,
                localFilename: document.localFilename,
                chunks: chunks.length,
            })
        }

        return results
    }

    private chunkContent(content: string): string[] {
        const chunks: string[] = []
        const normalizedContent = content.trim()

        for (
            let index = 0;
            index < normalizedContent.length;
            index += CHUNK_SIZE
        ) {
            const chunk = normalizedContent
                .slice(index, index + CHUNK_SIZE)
                .trim()

            if (chunk.length > 0) {
                chunks.push(chunk)
            }
        }

        return chunks
    }
}
