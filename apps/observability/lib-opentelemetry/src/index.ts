import { commitId } from './../dist/commitId.ts'
import { ENV } from './env.ts'
import { ILoggable } from './ILoggable.ts'
import { OpenTelemetry, type Logger } from './OpenTelemetry.ts'
import { otelException, enforceErrorType } from './otelException.ts'
import { parseEnvSchema } from './parseEnvSchema.ts'
import type { LogLevel } from './env'
import { SpanStatusCode } from '@opentelemetry/api'
import { FunctionHandlerLogger } from './FunctionHandlerLogger.ts'

export {
    type LogLevel,
    type Logger,
    OpenTelemetry,
    ILoggable,
    otelException,
    commitId,
    parseEnvSchema,
    ENV,
    enforceErrorType,
    SpanStatusCode,
    FunctionHandlerLogger,
}
