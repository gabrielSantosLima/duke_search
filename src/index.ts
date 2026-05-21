import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import {routes} from './routes.ts'
import morgan from 'morgan'
import {logger} from './logger.ts'

const app = express()
const PORT = process.env.PORT || 3333

app.use(
    cors({
        origin: '*',
    }),
)
app.use(
    morgan('combined', {
        stream: {write: message => logger.info(message.trim())},
    }),
)
app.use(express.json())
app.use(routes)

app.listen(PORT, () => {
    console.log(`The server is running in http://localhost:${PORT}`)
})
