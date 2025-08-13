import pino from 'pino'

/**
 * Logger for development use only
 */
export const LOG = pino({
    level: 'debug',
    transport: {
        target: 'pino-pretty',
    },
})
