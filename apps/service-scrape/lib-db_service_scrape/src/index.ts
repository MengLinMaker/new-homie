import { getKyselyPostgresDb } from './kysely.ts'
import * as Schema from './schema.ts'
import { config } from 'dotenv'
import { enumToArray, createPostgisPointString } from './util'

config()

/**
 * Uri to database from env variable
 * TODO: Replace env variable with SSM parameter store for better security
 */
export const DB_SERVICE_SCRAPE = process.env['DB_SERVICE_SCRAPE'] as string
export { getKyselyPostgresDb, Schema, enumToArray, createPostgisPointString }
