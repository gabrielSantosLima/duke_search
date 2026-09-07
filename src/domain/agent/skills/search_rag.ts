import {FunctionTool} from '@google/adk'
import {z} from 'zod'
import {PerformRagUseCase} from '../../chat/features/perform_rag_use_case.ts'
import {GenerateEmbeddingUseCase} from '../../chat/features/generate_embedding_use_case.ts'
import {PrismaClient} from '../../../../generated/prisma/client.ts'
import {PrismaPg} from '@prisma/adapter-pg'
import {Pool} from 'pg'
import {logger} from '../../../logger.ts'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({connectionString})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})

const generateEmbeddingUseCase = new GenerateEmbeddingUseCase()
const performRagUseCase = new PerformRagUseCase(
    prisma,
    generateEmbeddingUseCase,
)

export const searchRagTool = new FunctionTool({
    name: 'search_rag',
    description:
        'Searches indexed documents for relevant content using semantic search. ' +
        'Returns the relevant document excerpts and their source filenames.',
    parameters: z.object({
        query: z
            .string()
            .describe(
                'The search query or question about the indexed documents.',
            ),
    }),
    execute: async ({query}) => {
        logger.info(`Agent executing search_rag with query: ${query}`)
        const resultsJson = await performRagUseCase.execute(query)
        const results = JSON.parse(resultsJson) as {
            text: string
            page_number: number
            filename: string
        }[]
        return {
            results: results.map(r => ({
                content: r.text,
                source: r.filename,
            })),
        }
    },
})
