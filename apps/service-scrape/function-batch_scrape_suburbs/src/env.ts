import { z } from 'zod'
import { config } from 'dotenv'
config()

/**
 * @description Type safe env keys
 * @todo Use SSM Parameter Store
 */
export const ENV = {
  /**
   * @description Send Open Telemetry data to this URL
   * @description Sends to locally hosted SigNoz by default - http://localhost:3301
   * @default 'http://localhost:4318/v1/'
   */
  OLTP_BASE_URL: z
    .string()
    .regex(/https?:\/\/.+\/v1\//)
    .default('http://localhost:4318/v1/')
    .parse(process.env['OLTP_BASE_URL']),

  /**
   * @description Headers for Open Telemetry provider
   */
  OLTP_HEADERS: z
    .string()
    .regex(/(([\w-]+: [\w-_. ]+(, )?)+)?/)
    .default('')
    .parse(process.env['OLTP_HEADERS']),
}
