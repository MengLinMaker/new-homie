import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from './schema'
import { Pool } from 'pg'
import { ENV } from './env'
import { db_schema } from './schema'

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: ENV.POSTGRES_URL,
    }),
  }),
})

export { db_schema }
