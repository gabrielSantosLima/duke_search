import {createLogger, format, transports} from 'winston'

const {combine, timestamp, json} = format

export const logger = createLogger({
    level: 'info',
    format: combine(timestamp(), json()),
    transports: [
        new transports.File({filename: 'error.log', level: 'error'}),
        new transports.File({filename: 'combined.log'}),
    ],
})

// If not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: format.simple(),
        }),
    )
}
