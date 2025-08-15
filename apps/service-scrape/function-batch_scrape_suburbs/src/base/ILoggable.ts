import {
    ATTR_CODE_FUNCTION_NAME,
    ATTR_EXCEPTION_MESSAGE,
    ATTR_EXCEPTION_STACKTRACE,
    ATTR_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions'
import type { Level, Logger } from 'pino'

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
    return stacktrace
}

export class ILoggable {
    readonly LOGGER

    constructor(logger: Logger) {
        this.LOGGER = logger
    }

    /**
     * Enforce structured logging for error
     * @param logLevel pino logging level
     * @param func the method itself
     * @param msg message
     */
    public log<I, O>(logLevel: Level, func: (args: I) => O, msg: string | undefined = undefined) {
        // This class is the extended class
        const thisClass = Object.getPrototypeOf(this) as ILoggable
        const logInfo = {
            // OTEL semantic convention for code - https://opentelemetry.io/docs/specs/semconv/code/
            [ATTR_CODE_FUNCTION_NAME]: `${thisClass.constructor.name}.${func.name}`,
        }
        switch (logLevel) {
            case 'fatal':
                this.LOGGER.fatal(logInfo, msg)
                break
            case 'error':
                this.LOGGER.error(logInfo, msg)
                break
            case 'warn':
                this.LOGGER.warn(logInfo, msg)
                break
            case 'info':
                this.LOGGER.info(logInfo, msg)
                break
            case 'debug':
                this.LOGGER.debug(logInfo, msg)
                break
            case 'trace':
                this.LOGGER.trace(logInfo, msg)
                break
        }
    }

    /**
     * Enforce structured logging for error
     * @param logLevel pino logging level
     * @param error error from try catch
     * @param args method arguments
     * @param msg optional message
     */
    public logException<I, E>(
        logLevel: Level,
        maybeError: E,
        args: I | undefined = undefined,
        msg: string | undefined = undefined,
    ) {
        // This class is the extended class
        const validError = enforceErrorType(maybeError)
        const logInfo = {
            // OTEL semantic convention for code - https://opentelemetry.io/docs/specs/semconv/code/
            'code.function.args': args, // No convention
            // OTEL semantic convention for exceptions - https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-logs/
            [ATTR_EXCEPTION_TYPE]: validError.name,
            [ATTR_EXCEPTION_MESSAGE]: validError.message,
            [ATTR_EXCEPTION_STACKTRACE]: cleanStackTrace(validError.stack),
        }
        switch (logLevel) {
            case 'fatal':
                this.LOGGER.fatal(logInfo, msg)
                break
            case 'error':
                this.LOGGER.error(logInfo, msg)
                break
            case 'warn':
                this.LOGGER.warn(logInfo, msg)
                break
            case 'info':
                this.LOGGER.info(logInfo, msg)
                break
            case 'debug':
                this.LOGGER.debug(logInfo, msg)
                break
            case 'trace':
                this.LOGGER.trace(logInfo, msg)
                break
        }
    }
}
