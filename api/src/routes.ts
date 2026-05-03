import {Router} from 'express'
import {userRoutes} from './chat/routes.ts'

export const routes = Router()
routes.use(userRoutes)
