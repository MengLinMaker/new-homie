import { DB_SERVICE_SCRAPE } from './src/index.ts'
import { LOG } from './src/log.ts'
import { kyselyPostgresMigrate } from './src/migrator.ts'

const db = await kyselyPostgresMigrate(DB_SERVICE_SCRAPE)
if (db === null) {
    LOG.fatal('MIGRATION FAILED')
} else {
    await db.destroy()
}
