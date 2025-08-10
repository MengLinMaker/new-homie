import { DB_SERVICE_SCRAPE } from './src/index.ts'
import { kyselyPostgresMigrate, LOG } from './src/migrator.ts'

if (!DB_SERVICE_SCRAPE) {
    LOG.fatal('DB_SERVICE_SCRAPE is not defined')
    process.exit(1)
}
const db = await kyselyPostgresMigrate(DB_SERVICE_SCRAPE)
if (db === null) {
    LOG.fatal('MIGRATION FAILED')
    process.exit(1)
}
await db.destroy()
