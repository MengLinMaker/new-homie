import pino from 'pino'

/**
 * Logger for development use only
 */
export const LOG = pino({
    transport: {
        target: 'pino-pretty',
    },
})
