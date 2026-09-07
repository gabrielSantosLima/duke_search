import {InMemoryRunner} from '@google/adk'

interface Session {
    id: string
    userId: string
}

export class CreateSessionUseCase {
    async execute(runner: InMemoryRunner, userId: string): Promise<Session> {
        return runner.sessionService.createSession({
            appName: runner.appName,
            userId,
        })
    }
}
