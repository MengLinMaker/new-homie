import { parseEnvSchema } from '@observability/lib-opentelemetry'
import z from 'zod'

/**
 * Type safe env keys
 * @todo Use SSM Parameter Store instead
 */
export const ENV = parseEnvSchema(
    z.object({
        /**
         * function-scrape_locality AWS batch job definition
         */
        JOB_DEFINITION_ARN: z.string(),

        /**
         * function-scrape_locality AWS batch job queue
         */
        JOB_QUEUE_ARN: z.string(),
    }),
)
