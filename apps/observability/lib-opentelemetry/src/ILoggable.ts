import { ATTR_CODE_FUNCTION_NAME } from '@opentelemetry/semantic-conventions'
import type { Level } from 'pino'
import { otelException } from './otelException.ts'
import type { Logger } from './OpenTelemetry.ts'
import type { LogAttributes } from '@opentelemetry/api-logs';

class ILoggableError extends Error { }
export class ILoggable {
    readonly LOGGER

    constructor(logger: Logger) {
        this.LOGGER = logger
        if (this.constructor.name === ILoggable.name)
            throw new ILoggableError('Illegal instantiation of interface class ILoggable')
    }

    /**
     * Wrapper for logging internally
     * @param logLevel
     * @param logInfo
     * @param msg
     */
    private _log(logLevel: Level, attibutes: LogAttributes, msg?: string) {
        this.LOGGER(logLevel, attibutes, msg)
    }

    /**
     * Enforce structured logging for error
     * @param logLevel pino logging level
     * @param func the method itself
     * @param msg message
     */
    public log<I, O>(logLevel: Level, func: (args: I) => O, msg: string) {
        // This class is the extended class
        const thisClass = Object.getPrototypeOf(this) as ILoggable
        const logInfo = {
            [ATTR_CODE_FUNCTION_NAME]: `${thisClass.constructor.name}.${func.name}`,
        }
        this._log(logLevel, logInfo, msg)
    }

    /**
     * Enforce structured logging for error
     * @param logLevel pino logging level
     * @param func the method itself
     * @param maybeError error from try catch
     */
    public logException<I, O, E>(logLevel: Level, func: (args: I) => O, maybeError: E) {
        // This class is the extended class
        const thisClass = Object.getPrototypeOf(this) as ILoggable
        const logInfo: Record<string, string> = {
            ...otelException(maybeError),
            [ATTR_CODE_FUNCTION_NAME]: `${thisClass.constructor.name}.${func.name}`,
        }
        this._log(logLevel, logInfo)
    }

    /**
     * Enforce structured logging for error
     * @param logLevel pino logging level
     * @param func the method itself
     * @param args method arguments
     * @param maybeError error from try catch
     */
    public logExceptionArgs<I, O, E>(
        logLevel: Level,
        func: (args: I) => O,
        args: I,
        maybeError: E,
    ) {
        // This class is the extended class
        const thisClass = Object.getPrototypeOf(this) as ILoggable
        const logInfo: Record<string, string> = {
            ...otelException(maybeError),
            [ATTR_CODE_FUNCTION_NAME]: `${thisClass.constructor.name}.${func.name}`,
            // No OTEL semantic convention
            'code.function.args': JSON.stringify(args),
        }
        this._log(logLevel, logInfo)
    }
}
