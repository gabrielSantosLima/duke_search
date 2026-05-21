import OpenAI from 'openai'
import {Model} from '../entities/model'

export class ListModelsUseCase {
    constructor(private openai: OpenAI) {}

    async execute(): Promise<Model[]> {
        const models = await this.openai.models.list()
        return models.data.map<Model>(model => {
            return {
                modelId: model.id,
            }
        })
    }
}
