import {InMemoryRunner} from '@google/adk'
import {rootAgent} from '../agent.ts'

export class InMemoryRunnerSingleton {
    private static instance: InMemoryRunner

    public static getInstance(): InMemoryRunner {
        if (!InMemoryRunnerSingleton.instance) {
            InMemoryRunnerSingleton.instance = new InMemoryRunner({
                agent: rootAgent,
            })
        }

        return InMemoryRunnerSingleton.instance
    }
}
