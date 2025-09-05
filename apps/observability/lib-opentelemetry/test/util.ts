import pino from 'pino'
import path from 'node:path'

export const suiteNameFromFileName = (filePath: string) =>
    // biome-ignore lint/style/noNonNullAssertion: <will exist>
    path.basename(filePath).split('.').shift()!

export const LOGGER = pino({
    level: 'fatal',
    transport: {
        target: 'pino-pretty',
    },
})
