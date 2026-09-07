import {InMemoryRunner} from '@google/adk'

interface Session {
    id: string
    userId: string
}

export class CreateSessionUseCase {
    async execute(runner: InMemoryRunner): Promise<Session> {
        return runner.sessionService.createSession({
            appName: runner.appName,
            userId: 'api-user',
        })
    }
}
