/** biome-ignore-all lint/complexity/useLiteralKeys: <All env variables can be potentially accessed> */
import { z } from 'zod'
import type { Level } from 'pino'

import { parseEnvSchema } from './parseEnvSchema'

/**
 *  Type safe env keys
 * @todo Use SSM Parameter Store instead
 */
export const ENV = parseEnvSchema(
    z.object({
        /**
         * Send Open Telemetry data to this URL
         * Sends to locally hosted Grafana LGTM
         * @default 'http://localhost:4318'
         */
        OTEL_EXPORTER_OTLP_ENDPOINT: z
            .string()
            .regex(/https?:\/\/.+/)
            .default('http://localhost:4318'),

        /**
         * Headers for Open Telemetry provider
         * @example key1: val1, key2, val2
         */
        OTEL_EXPORTER_OTLP_HEADERS: z
            .string()
            .regex(/(([\w-]+: [\w-_. ]+(, )?)+)?/)
            .default(''),

        /**
         * Log level at bootup
         * Levels that Grafana can receive
         */
        OTEL_LOG_LEVEL: z
            .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'] satisfies Level[])
            .default('warn'),
    }),
)
