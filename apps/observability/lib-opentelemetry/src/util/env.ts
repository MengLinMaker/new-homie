/** biome-ignore-all lint/complexity/useLiteralKeys: <All env variables can be potentially accessed> */
import { z } from 'zod'
import { config } from 'dotenv'
import type { Level } from 'pino'
config()

/**
 * @description Type safe env keys
 * @todo Use SSM Parameter Store instead
 */
export const ENV = {
    /**
     * @description Send Open Telemetry data to this URL
     * @description Sends to locally hosted Grafana LGTM
     * @default 'http://localhost:4318'
     */
    OTEL_EXPORTER_OTLP_ENDPOINT: z
        .string()
        .regex(/https?:\/\/.+/)
        .default('http://localhost:4318')
        .parse(process.env['OLTP_BASE_URL']),

    /**
     * @description Headers for Open Telemetry provider
     * @example key1: val1, key2, val2
     */
    OTEL_EXPORTER_OTLP_HEADERS: z
        .string()
        .regex(/(([\w-]+: [\w-_. ]+(, )?)+)?/)
        .default('')
        .parse(process.env['OLTP_HEADERS']),

    /**
     * @description Log level at bootup
     */
    LOG_LEVEL: z
        .enum(['debug', 'error', 'fatal', 'info', 'trace', 'warn'] satisfies Level[])
        .default('warn')
        .parse(process.env['LOG_LEVEL']),
}
