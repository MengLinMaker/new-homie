import { z } from 'zod'
import { consola } from 'consola'
import { config } from 'dotenv'
config()

/**
 * @description Type safe env keys
 * @todo Use SSM Parameter Store
 */
export const ENV = {
  /**
   * @description Postgres connection url with password
   */
  POSTGRES_URL: z
    .string()
    .regex(/postgresql:\/\/\w+:\w+@[\w-.:]+\/\w+((\?)(\w+=\w+)+)?/, {
      message: 'POSTGRES_URL is invalid',
    })
    .default('postgresql://user:password@localhost:54320/db')
    .parse(process.env['POSTGRES_URL']),
}
if (!process.env['POSTGRES_URL'])
  consola.warn(
    'Undefined env POSTGRES_URL, defaulting to  postgresql://user:password@localhost:54320/db',
  )
