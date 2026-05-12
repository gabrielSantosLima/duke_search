import {Router} from 'express'
import {InvokeLLMUseCase} from './features/InvokeLLMUseCase.ts'
import {PrismaClient} from '../../generated/prisma/client.ts'
import {PrismaPg} from '@prisma/adapter-pg'
import {Pool} from 'pg'
import {pipeline} from '@huggingface/transformers'
import {semanticSearch} from '../../generated/prisma/sql.ts'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({connectionString})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

export const chatRoutes = Router()
const path = '/chat'

interface ChatBody {
    message: {content: string}
}

const invokeLLMUseCase = new InvokeLLMUseCase()

chatRoutes.post(path, async (req, resp) => {
    const {message} = req.body as ChatBody
    const {content} = message
    const output = await embedder(content, {
        pooling: 'mean',
        normalize: true,
    })
    const embedding = `[${Array.from(output.data).join(',')}]`
    const responseDatabase = await prisma.$queryRawTyped(
        semanticSearch(embedding),
    )
    const ragContent = JSON.stringify(
        responseDatabase.map(response => {
            return {
                text: response.content,
                page_number: response.page_number,
                filename: response.source_name,
            }
        }),
    )
    const response = await invokeLLMUseCase.execute(ragContent, content)
    return resp.status(200).json({
        answer: response,
    })
})
