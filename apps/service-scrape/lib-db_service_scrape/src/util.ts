import { sql, type SQL } from 'drizzle-orm'
import type { ExtraConfigColumn, PgIndexMethod } from 'drizzle-orm/pg-core'
import { check, index } from 'drizzle-orm/pg-core'

/**
 * @param tableName
 * @returns functions to create an index named {tableName}_{columnName}_{suffix}
 */
export const conventionalConstraintFactory = (tableName: string) => ({
  index: (indexMethod: PgIndexMethod, column: ExtraConfigColumn) =>
    index(`${tableName}_${column.name}_idx`).using(indexMethod, column),

  textSearchIndex: (column: ExtraConfigColumn) =>
    index(`${tableName}_${column.name}_idx`).using('gist', sql`to_tsvector('english', ${column})`),

  check: (column: ExtraConfigColumn, sqlQuery: SQL) =>
    check(`${tableName}_${column.name}_check`, sqlQuery),
})
