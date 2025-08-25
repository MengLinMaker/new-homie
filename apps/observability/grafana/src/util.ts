/** biome-ignore-all lint/complexity/useLiteralKeys: <All env variables can be potentially accessed> */
import { z } from 'zod'
import { config } from 'dotenv'
config()

/**
 * @description Type safe env keys
 */
export const ENV = {
    /**
     * @description For deploying dashboards to Grafana
     * @default 'http://localhost:3000/api' - Locally hosted Grafana LGTM
     */
    GRAFANA_API: z
        .string()
        .regex(/https?:\/\/.+\/api/)
        .default('http://localhost:3000/api')
        .parse(process.env['GRAFANA_API']),

    GRAFANA_API_KEY: z.string().default('').parse(process.env['GRAFANA_API_KEY']),
}

export const RESOURCE_FOLDER = `${import.meta.dirname}/../resource`
