import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from './schema'
import { Pool } from 'pg'
import { ENV } from './env'

/**
 * @description Kysely database query builder
 * @link Kysely docs: https://kysely.dev/
 */
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: ENV.POSTGRES_URL,
    }),
  }),
})
