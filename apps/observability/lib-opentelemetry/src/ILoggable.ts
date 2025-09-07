import { ATTR_CODE_FUNCTION_NAME } from '@opentelemetry/semantic-conventions'
import type { Level, Logger } from 'pino'
import { otelException } from './otelException'

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
            [ATTR_CODE_FUNCTION_NAME]: `${thisClass.constructor.name}.${func.name}`,
        }

        if (!msg) msg = `${logLevel.toUpperCase()} ${thisClass.constructor.name}.${func.name}`

        /* v8 ignore start */
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
     * @param func the method itself
     * @param args method arguments
     * @param msg optional message
     */
    public logException<I, O, E>(
        logLevel: Level,
        func: (args: I) => O,
        maybeError: E,
        args: I | undefined = undefined,
        msg: string | undefined = undefined,
    ) {
        // This class is the extended class
        const thisClass = Object.getPrototypeOf(this) as ILoggable
        const logInfo = {
            // OTEL semantic convention for code - https://opentelemetry.io/docs/specs/semconv/code/
            'code.function.args': args, // No convention
            [ATTR_CODE_FUNCTION_NAME]: `${thisClass.constructor.name}.${func.name}`,
            ...otelException(maybeError),
        }

        if (!msg) msg = `${logLevel.toUpperCase()} ${thisClass.constructor.name}.${func.name}`

        /* v8 ignore start */
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
