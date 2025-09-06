import {
    ATTR_EXCEPTION_MESSAGE,
    ATTR_EXCEPTION_STACKTRACE,
    ATTR_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions'

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
 * Formats unkown into error according to OTEL semantic convention - https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-logs/
 * @param maybeError
 * @returns Formatted error
 */
export const otelException = (maybeError: unknown) => {
    const e = enforceErrorType(maybeError)
    return {
        [ATTR_EXCEPTION_TYPE]: e.name,
        [ATTR_EXCEPTION_MESSAGE]: e.message,
        [ATTR_EXCEPTION_STACKTRACE]: e.stack,
    }
}
