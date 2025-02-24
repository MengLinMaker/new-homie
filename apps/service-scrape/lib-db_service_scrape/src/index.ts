import { z } from 'zod'
import { config } from 'dotenv'
import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from './schema'
import { Pool } from 'pg'
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
    .regex(/postgresql:\/\/\w+:\w+@[\w-.:]+\/\w+((\?)(\w+=\w+)+)?/)
    .parse(process.env['POSTGRES_URL']),
}
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: ENV.POSTGRES_URL,
    }),
  }),
})
