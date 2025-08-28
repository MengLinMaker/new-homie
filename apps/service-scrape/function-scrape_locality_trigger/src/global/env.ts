/** biome-ignore-all lint/complexity/useLiteralKeys: <All env variables can be potentially accessed> */
import { parseEnvSchema } from '@observability/lib-opentelemetry'
import z from 'zod'

/**
 * Type safe env keys
 * @todo Use SSM Parameter Store instead
 */
export const ENV = parseEnvSchema(
    z.object({
        /**
         * SQS queue url
         */
        QUEUE_URL: z.url(),
    }),
)
