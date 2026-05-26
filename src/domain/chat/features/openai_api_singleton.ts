import OpenAI from 'openai'
import {MODEL_API_KEY, MODEL_BASE_URL} from '../../../constants'

export class OpenAIAPISingleton {
    private static instance: OpenAI

    public static getInstance(): OpenAI {
        if (!OpenAIAPISingleton.instance) {
            OpenAIAPISingleton.instance = new OpenAI({
                baseURL: MODEL_BASE_URL,
                apiKey: MODEL_API_KEY,
            })
        }
        return OpenAIAPISingleton.instance
    }
}
