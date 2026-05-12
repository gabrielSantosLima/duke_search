import {Router} from 'express'
import {InvokeLLMUseCase} from './features/InvokeLLMUseCase.ts'

export const userRoutes = Router()
const path = '/chat'

interface ChatBody {
    message: {content: string}
}

const invokeLLMUseCase = new InvokeLLMUseCase()

userRoutes.post(path, async (req, resp) => {
    const {message} = req.body as ChatBody
    const {content} = message
    const response = await invokeLLMUseCase.execute(content)
    return resp.status(200).json({
        answer: response,
    })
})
