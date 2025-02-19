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
   * @description Sends to Seq by default
   * @default 'http://localhost:5341/ingest/otlp/v1/logs'
   */
  OLTP_URL: z
    .string()
    .regex(/https?:\/\/.+/)
    .default('http://localhost:5341/ingest/otlp/v1/logs')
    .parse(process.env['OLTP_URL']),

  /**
   * @description Headers for Open Telemetry provider
   */
  OLTP_HEADERS: z
    .string()
    .regex(/([\w-]+: [\w-_. ]+(, )?)+/)
    .default('X-Seq-ApiKey: abcd1234, Useless-Header: Useless')
    .parse(process.env['OLTP_HEADERS']),

  /**
   * @description Postgres connection url with password
   */
  POSTGRES_URL: (() => {
    try {
      z.string()
        .regex(/postgresql:\/\/\w+:\w+@[\w-.]+\/\w+((\?)(\w+=\w+)+)?/)
        .default('postgresql:')
        .parse(process.env['POSTGRES_URL'])
    } catch {
      // Crash fatal error
      console.error(
        'POSTGRES_URL env variable does not match regex: /postgresql:\\/\\/\\w+:\\w+@[\\w-.]+\\/\\w+((\\?)(\\w+=\\w+)+)?/',
      )
      process.kill(process.pid, 'SIGTERM')
    }
  })(),
}
