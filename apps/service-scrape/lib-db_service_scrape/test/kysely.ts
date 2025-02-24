import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { ENV } from './env'
import type { Database } from '../src/schema'

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: ENV.TEST_POSTGRES_URL,
    }),
  }),
})
