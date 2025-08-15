import { getKyselyPostgresDb } from './connection.ts'
import * as Schema from './schema.ts'
import { config } from 'dotenv'
import { enumToArray, createPostgisPointString, createPostgisPolygonString } from './util'

config()

/**
 * Uri to database from env variable
 * @todo: Replace env variable with SSM parameter store for better security
 */
// biome-ignore lint/complexity/useLiteralKeys: <untyped>
export const DB_SERVICE_SCRAPE = process.env['DB_SERVICE_SCRAPE']

export {
    getKyselyPostgresDb,
    Schema,
    enumToArray,
    createPostgisPointString,
    createPostgisPolygonString,
}
