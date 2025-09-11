import { z } from 'zod'

import { parseEnvSchema } from '../../lib-opentelemetry/src/parseEnvSchema.ts'

/**
 * @description Type safe env keys
 */
export const ENV = parseEnvSchema(
    z.object({
        /**
         * @description For deploying dashboards to Grafana
         * @default 'http://localhost:3000/api' - Locally hosted Grafana LGTM
         */
        GRAFANA_API: z
            .string()
            .regex(/https?:\/\/.+\/api/)
            .default('http://localhost:3000/api'),

        GRAFANA_API_KEY: z.string().default(''),
    }),
)
