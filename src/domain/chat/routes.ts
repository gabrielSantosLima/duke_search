import {Router} from 'express'
import {AskUseCase} from './features/ask_use_case.ts'
import {PrismaClient} from '../../../generated/prisma/client.ts'
import {PrismaPg} from '@prisma/adapter-pg'
import {Pool} from 'pg'
import {OpenAIAPISingleton} from './features/openai_api_singleton.ts'
import {ListModelsUseCase} from './features/list_models_use_case.ts'
import {GenerateEmbeddingUseCase} from './features/generate_embedding_use_case.ts'
import {PerformRagUseCase} from './features/perform_rag_use_case.ts'
import {EMBEDDING_MODEL_ID} from '../../constants.ts'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({connectionString})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})

const openai = OpenAIAPISingleton.getInstance()
const listModelsUseCase = new ListModelsUseCase(openai)
const generateEmbeddingUseCase = new GenerateEmbeddingUseCase()
const performRagUseCase = new PerformRagUseCase(
    prisma,
    generateEmbeddingUseCase,
    new AskUseCase(),
)

export const chatRoutes = Router()
const CHAT_COMPLETIONS_PATH = '/v1/chat/completions'
const LIST_MODELS_PATH = '/v1/models'
const EMBEDDINGS_PATH = '/v1/embeddings'

interface ChatBody {
    message: {content: string}
}

interface EmbeddingsBody {
    input: string | string[]
    model?: string
}

chatRoutes.post(CHAT_COMPLETIONS_PATH, async (req, resp) => {
    try {
        const {message} = req.body as Partial<ChatBody>

        if (!message?.content || typeof message.content !== 'string') {
            return resp.status(400).json({
                message:
                    'The "message.content" field is required and must be a string.',
            })
        }

        const answer = await performRagUseCase.execute(message.content)

        return resp.status(200).json({answer})
    } catch {
        return resp
            .status(500)
            .json({message: 'Failed to process chat request.'})
    }
})

chatRoutes.get(LIST_MODELS_PATH, async (_, resp) => {
    try {
        const models = await listModelsUseCase.execute()
        return resp.status(200).json({models})
    } catch {
        return resp.status(500).json({message: 'Failed to list models.'})
    }
})

chatRoutes.post(EMBEDDINGS_PATH, async (req, resp) => {
    try {
        const {input, model} = req.body as Partial<EmbeddingsBody>

        if (!input || (typeof input !== 'string' && !Array.isArray(input))) {
            return resp.status(400).json({
                message:
                    'The "input" field is required and must be a string or an array of strings.',
            })
        }

        const inputs = Array.isArray(input) ? input : [input]
        if (inputs.some(value => typeof value !== 'string')) {
            return resp.status(400).json({
                message: 'When "input" is an array, all items must be strings.',
            })
        }

        const data = await Promise.all(
            inputs.map(async (text, index) => {
                const embedding = await generateEmbeddingUseCase.execute(text)
                return {
                    object: 'embedding',
                    embedding,
                    index,
                }
            }),
        )

        const modelId = model || EMBEDDING_MODEL_ID

        return resp.status(200).json({
            object: 'list',
            data,
            model: modelId,
            usage: {
                prompt_tokens: 0,
                total_tokens: 0,
            },
        })
    } catch {
        return resp
            .status(500)
            .json({message: 'Failed to process embedding request.'})
    }
})
