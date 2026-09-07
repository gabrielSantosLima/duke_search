import {PrismaClient} from '../../../../generated/prisma/client.ts'

export class ListRegisteredFilesUseCase {
    constructor(private prisma: PrismaClient) {}

    async execute(): Promise<
        {filename: string; localFilename: string; chunks: number}[]
    > {
        const result = await this.prisma.$queryRaw<
            {source_name: string | null; local_filename: string | null; count: number}[]
        >`
            SELECT source_name, local_filename, COUNT(*)::int as count
            FROM document_knowledge
            GROUP BY source_name, local_filename
            ORDER BY source_name
        `

        return result
            .filter(r => r.source_name)
            .map(r => ({
                filename: r.source_name!,
                localFilename: r.local_filename || '',
                chunks: r.count,
            }))
    }
}
