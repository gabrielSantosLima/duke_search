import {Router} from 'express'
import {agentRoutes} from './domain/agent/index.ts'
import {chatRoutes} from './domain/chat/routes.ts'
import {documentsRoutes} from './domain/document/routes.ts'

export const routes = Router()
routes.use(agentRoutes)
routes.use(chatRoutes)
routes.use(documentsRoutes)
