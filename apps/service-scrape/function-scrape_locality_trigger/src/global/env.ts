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
        QUEUE_URL: z.string(),

        // AWS credentials
        AWS_ENDPOINT_URL: z.string().optional(),
        AWS_REGION: z.string().optional(),
        AWS_ACCESS_KEY_ID: z.string().optional(),
        AWS_SECRET_ACCESS_KEY: z.string().optional(),
    }),
)
