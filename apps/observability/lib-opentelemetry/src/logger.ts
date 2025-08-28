import {
    ATTR_EXCEPTION_MESSAGE,
    ATTR_EXCEPTION_STACKTRACE,
    ATTR_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions'
import { ENV } from './env'
import pino from 'pino'
import pinoOpentelemetryTransport from 'pino-opentelemetry-transport'

export const LOGGER = pino(
    {
        level: ENV.LOG_LEVEL,
    },
    await pinoOpentelemetryTransport({
        loggerName: '',
        serviceVersion: '',
    }),
)

/**
 * Force error to be type of Error - https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
 * @param maybeError
 * @returns
 */
const enforceErrorType = (maybeError: unknown) => {
    if (maybeError instanceof Error) return maybeError
    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        return new Error(String(maybeError))
    }
}

/**
 * Remove message from stack trace
 * @param stacktrace Error.stack
 * @returns Stacktrace without messages
 */
const cleanStackTrace = (stacktrace: string | undefined) => {
    if (!stacktrace) return undefined
    const stackRegex = /at (?:(.+?) )?\(?([^:]+):(\d+):(\d+)\)?/
    const lines = stacktrace.split('\n')
    const newLines = []
    for (const line of lines) {
        if (line.match(stackRegex)) newLines.push(line)
    }
    if (newLines.length > 0) return newLines.join('\n')
    /* v8 ignore start */
    return stacktrace
}

/**
 * Formats unkown into error according to OTEL semantic convention - https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-logs/
 * @param maybeError
 * @returns Formatted error
 */
export const otelException = (maybeError: unknown) => {
    const e = enforceErrorType(maybeError)
    return {
        [ATTR_EXCEPTION_TYPE]: e.name,
        [ATTR_EXCEPTION_MESSAGE]: e.message,
        [ATTR_EXCEPTION_STACKTRACE]: cleanStackTrace(e.stack),
    }
}
