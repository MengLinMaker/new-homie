import { Kysely, PostgresDialect, sql, type RawBuilder } from 'kysely'
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

export const toPgDatetime = (inputDatetime: string | null | undefined) =>
  inputDatetime
    ? new Date(inputDatetime).toISOString().replaceAll('T', ' ').replaceAll('Z', '')
    : null

export const toPgPoint = (pt: [number, number]): RawBuilder<[number, number]> => {
  const point = `(${pt[0]},${pt[1]})`
  return sql<[number, number]>`${point}`
}
