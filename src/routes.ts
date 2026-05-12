import {Router} from 'express'
import {chatRoutes} from './chat/routes.ts'

export const routes = Router()
routes.use(chatRoutes)
