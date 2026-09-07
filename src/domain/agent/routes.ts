import {Router} from 'express'
import {InMemoryRunnerSingleton} from './features/runner_singleton.ts'
import {CreateSessionUseCase} from './features/create_session_use_case.ts'
import {RunAgentUseCase} from './features/run_agent_use_case.ts'
import {logger} from '../../logger.ts'

export const agentRoutes = Router()

const runner = InMemoryRunnerSingleton.getInstance()
const createSessionUseCase = new CreateSessionUseCase()
const runAgentUseCase = new RunAgentUseCase()

agentRoutes.post('/v1/chat/completions', async (req, resp) => {
    try {
        const {message} = req.body as {message?: {content?: string}}

        if (!message?.content || typeof message.content !== 'string') {
            return resp.status(400).json({
                message:
                    'The "message.content" field is required and must be a string.',
            })
        }

        const session = await createSessionUseCase.execute(runner, 'api-user')
        const answer = await runAgentUseCase.execute(
            runner,
            session,
            message.content,
        )

        return resp.status(200).json({answer})
    } catch (error) {
        logger.error(`Agent route error: ${error}`)
        return resp
            .status(500)
            .json({message: 'Failed to process chat request.'})
    }
})
