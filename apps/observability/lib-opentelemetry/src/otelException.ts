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
    // Assume error doesn't have to be error type, as long as type interface is enforced
    const isError = maybeError as Error | undefined
    if (isError?.name && isError.message) return isError

    try {
        return Error(JSON.stringify(maybeError))
    } catch {
        return Error(String(maybeError))
    }
}

/**
 * Formats unkown into error according to OTEL semantic convention - https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-logs/
 * @param maybeError
 * @returns Formatted error
 */
export const otelException = (maybeError: unknown) => {
    const e = enforceErrorType(maybeError)
    const structuredError: Record<string, string> = {
        [ATTR_EXCEPTION_TYPE]: e.name,
        [ATTR_EXCEPTION_MESSAGE]: e.message,
    }
    if (e.stack) structuredError[ATTR_EXCEPTION_STACKTRACE] = e.stack
    return structuredError
}
