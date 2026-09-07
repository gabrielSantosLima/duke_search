import {OpenAIClient} from '../../openai/index.ts'
import {MODEL_API_KEY, MODEL_BASE_URL} from '../../../constants.ts'

export class OpenAIAPISingleton {
    private static instance: OpenAIClient

    public static getInstance(): OpenAIClient {
        if (!OpenAIAPISingleton.instance) {
            OpenAIAPISingleton.instance = new OpenAIClient({
                baseURL: MODEL_BASE_URL,
                apiKey: MODEL_API_KEY,
            })
        }
        return OpenAIAPISingleton.instance
    }
}
