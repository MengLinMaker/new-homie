import { Kysely, PostgresDialect, sql, type RawBuilder } from 'kysely'
import type { Database } from './schema'
import { Pool } from 'pg'
import { ENV } from './env'
import { db_schema } from './schema'

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


export { db_schema }

/**
 * @param inputDatetime - JavaScript compatible timestamp string.
 * @returns Postgres compatible timestamp string.
 * @link Postgres timestamp spec: https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-DATETIME-INPUT-TIME-STAMPS
 */
export const toPgDatetime = (inputDatetime: string | null | undefined) =>
  inputDatetime
    ? new Date(inputDatetime).toISOString().replaceAll('T', ' ').replaceAll('Z', '')
    : null

/**
 *
 * @param pt - [Latitude, Longitude] tuple.
 * @returns Kysely sql for creating Postgres point.
 * @lint Postgres points doc: https://www.postgresql.org/docs/current/datatype-geometric.html#DATATYPE-GEOMETRIC-POINTS
 */
export const toPgPoint = (pt: [number, number]): RawBuilder<[number, number]> => {
  const point = `(${pt[0]},${pt[1]})`
  return sql<[number, number]>`${point}`
}
