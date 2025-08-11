import { DB_SERVICE_SCRAPE } from './src/index.ts'
import { LOG } from './src/dev/log.ts'
import { kyselyPostgisMigrate } from './src/dev/migrator.ts'

if (!DB_SERVICE_SCRAPE) {
    LOG.fatal('DB_SERVICE_SCRAPE is not defined')
    process.exit(1)
}
const db = await kyselyPostgisMigrate(DB_SERVICE_SCRAPE)
if (db === null) {
    LOG.fatal('MIGRATION FAILED')
    process.exit(1)
}
await db.destroy()
