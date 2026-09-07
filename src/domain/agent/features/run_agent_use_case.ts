import {createUserContent} from '@google/genai'
import {InMemoryRunner} from '@google/adk'
import {logger} from '../../../logger.ts'

interface Session {
    id: string
    userId: string
}

export class RunAgentUseCase {
    async execute(
        runner: InMemoryRunner,
        session: Session,
        messageContent: string,
    ): Promise<string> {
        const userContent = createUserContent(messageContent)
        const events: unknown[] = []

        for await (const event of runner.runAsync({
            userId: session.userId,
            sessionId: session.id,
            newMessage: userContent,
        })) {
            events.push(event)
        }

        const finalEvent = events[events.length - 1] as
            | {
                  content?: {parts?: {text?: string}[]}
                  errorCode?: string
                  errorMessage?: string
              }
            | undefined

        if (finalEvent?.content?.parts?.length) {
            return finalEvent.content.parts
                .map(p => p.text || '')
                .join('')
        }

        if (finalEvent?.errorCode) {
            logger.error(
                `Agent error: ${finalEvent.errorCode} - ${finalEvent.errorMessage}`,
            )
            throw new Error(
                finalEvent.errorMessage || 'Agent processing failed.',
            )
        }

        throw new Error('No response available from agent.')
    }
}
