/** biome-ignore-all lint/complexity/useLiteralKeys: <All env variables can be potentially accessed> */
import { z } from 'zod'
import type { Level } from 'pino'

import { parseEnvSchema } from './parseEnvSchema'

/**
 * @description Type safe env keys
 * @todo Use SSM Parameter Store instead
 */
export const ENV = parseEnvSchema(
    z.object({
        /**
         * @description Send Open Telemetry data to this URL
         * @description Sends to locally hosted Grafana LGTM
         * @default 'http://localhost:4318'
         */
        OTEL_EXPORTER_OTLP_ENDPOINT: z
            .string()
            .regex(/https?:\/\/.+/)
            .default('http://localhost:4318'),

        /**
         * @description Headers for Open Telemetry provider
         * @example key1: val1, key2, val2
         */
        OTEL_EXPORTER_OTLP_HEADERS: z
            .string()
            .regex(/(([\w-]+: [\w-_. ]+(, )?)+)?/)
            .default(''),

        /**
         * @description Log level at bootup
         */
        LOG_LEVEL: z
            .enum(['debug', 'error', 'fatal', 'info', 'trace', 'warn'] satisfies Level[])
            .default('warn'),
    }),
)
