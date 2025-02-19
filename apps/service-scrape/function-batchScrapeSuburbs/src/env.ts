import { z } from 'zod'

require('dotenv').config()

/**
 * @description Type safe env keys
 * @todo Use SSM Parameter Store
 */
export const ENV = {
  /**
   * @description Changes log level for next serverless execution
   * @default 'info'
   */
  LOG_LEVEL: z
    .enum(['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info')
    .parse(process.env['LOG_LEVEL']),

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
