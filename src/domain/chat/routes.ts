import {Router} from 'express'
import {OpenAIAPISingleton} from './features/openai_api_singleton.ts'
import {ListModelsUseCase} from './features/list_models_use_case.ts'
import {GenerateEmbeddingUseCase} from './features/generate_embedding_use_case.ts'
import {EMBEDDING_MODEL_ID} from '../../constants.ts'

const openai = OpenAIAPISingleton.getInstance()
const listModelsUseCase = new ListModelsUseCase(openai)
const generateEmbeddingUseCase = new GenerateEmbeddingUseCase()

export const chatRoutes = Router()
const LIST_MODELS_PATH = '/v1/models'
const EMBEDDINGS_PATH = '/v1/embeddings'

interface EmbeddingsBody {
    input: string | string[]
    model?: string
}

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
