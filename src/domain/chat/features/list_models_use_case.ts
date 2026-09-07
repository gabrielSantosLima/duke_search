import {OpenAIClient} from '../../../modules/openai/index.ts'
import {Model} from '../entities/model.ts'

export class ListModelsUseCase {
    constructor(private openai: OpenAIClient) {}

    async execute(): Promise<Model[]> {
        const models = await this.openai.listModels()
        return models.data.map<Model>(model => {
            return {
                modelId: model.id,
            }
        })
    }
}
