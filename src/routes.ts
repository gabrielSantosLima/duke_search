import {Router} from 'express'
import {chatRoutes} from './domain/chat/routes.ts'
import {inferenceRoutes} from './domain/inference/routes.ts'
import {documentsRoutes} from './domain/document/routes.ts'

export const routes = Router()
routes.use(chatRoutes)
routes.use(documentsRoutes)
routes.use(inferenceRoutes)
