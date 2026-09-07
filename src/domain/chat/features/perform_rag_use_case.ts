import {PrismaClient} from '../../../../generated/prisma/client.ts'
import {semanticSearch} from '../../../../generated/prisma/sql.ts'
import {GenerateEmbeddingUseCase} from './generate_embedding_use_case.ts'

export class PerformRagUseCase {
    constructor(
        private prisma: PrismaClient,
        private generateEmbeddingUseCase: GenerateEmbeddingUseCase,
    ) {}

    async execute(prompt: string): Promise<string> {
        const output = await this.generateEmbeddingUseCase.execute(prompt)
        const embedding = `[${output.join(',')}]`

        const responseDatabase = await this.prisma.$queryRawTyped(
            semanticSearch(embedding),
        )

        return JSON.stringify(
            responseDatabase.map(response => {
                return {
                    text: response.content,
                    page_number: response.page_number,
                    filename: response.source_name,
                }
            }),
        )
    }
}
