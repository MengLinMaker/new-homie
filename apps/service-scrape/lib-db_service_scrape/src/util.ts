import { sql as drizzleSql, type SQL } from 'drizzle-orm'
import type { ExtraConfigColumn, PgIndexMethod } from 'drizzle-orm/pg-core'
import { check, index } from 'drizzle-orm/pg-core'
import { sql as kyselySql, type RawBuilder } from 'kysely'

/**
 * @param tableName
 * @returns functions to create an index named {tableName}_{columnName}_{suffix}
 */
export const conventionalConstraintFactory = (tableName: string) => ({
  index: (indexMethod: PgIndexMethod, column: ExtraConfigColumn) =>
    index(`${tableName}_${column.name}_idx`).using(indexMethod, column),

  textSearchIndex: (column: ExtraConfigColumn) =>
    index(`${tableName}_${column.name}_idx`).using(
      'gist',
      drizzleSql`to_tsvector('english', ${column})`,
    ),

  check: (column: ExtraConfigColumn, sqlQuery: SQL) =>
    check(`${tableName}_${column.name}_check`, sqlQuery),
})

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
  return kyselySql<[number, number]>`${point}`
}
