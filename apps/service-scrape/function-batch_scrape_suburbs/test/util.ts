import { readFileSync } from 'node:fs'
import pino from 'pino'

export const parseJsonFile = (path: string) => JSON.parse(readFileSync(path).toString())

export const LOGGER = pino({
    level: 'fatal',
    transport: {
        target: 'pino-pretty',
    },
})
