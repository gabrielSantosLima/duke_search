import {Router} from 'express'
import {chatRoutes} from './domain/chat/routes.ts'
import {documentsRoutes} from './domain/document/routes.ts'

export const routes = Router()
routes.use(chatRoutes)
routes.use(documentsRoutes)
