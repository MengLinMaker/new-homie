import { z } from 'zod'
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
    .regex(/postgresql:\/\/\w+:\w+@[\w-.]+\/\w+((\?)(\w+=\w+)+)?/)
    .default('postgresql:')
    .parse(process.env['POSTGRES_URL']),
}
