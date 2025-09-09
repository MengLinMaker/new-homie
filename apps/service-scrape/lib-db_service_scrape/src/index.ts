import { getKyselyPostgresDb } from './connection.ts'
import * as Schema from './schema.ts'
import { createPostgisPointString, createPostgisPolygonString } from './util.ts'

import { config } from 'dotenv'
config({ quiet: true })

/**
 * Uri to database from env variable
 * @todo: Replace env variable with SSM parameter store for better security
 */
export const DB_SERVICE_SCRAPE =
    // biome-ignore lint/complexity/useLiteralKeys: <untyped>
    process.env['DB_SERVICE_SCRAPE'] ?? 'postgres://user:password@localhost:54320/db'

export { getKyselyPostgresDb, Schema, createPostgisPointString, createPostgisPolygonString }
