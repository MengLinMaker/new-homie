import { parseEnvSchema } from '@observability/lib-opentelemetry'
import z from 'zod'

/**
 * Type safe env keys
 * @todo Use SSM Parameter Store instead
 */
export const ENV = parseEnvSchema(
    z.object({
        /**
         * For triggering StepFunctionsScrapePipeline
         */
        STEP_FUNCTION_ARN: z.string(),
    }),
)
