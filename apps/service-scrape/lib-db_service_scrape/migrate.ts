import { DB_SERVICE_SCRAPE } from './src/index.ts'
import { kyselyPostgisMigrate } from './src/dev/migrator.ts'

if (!DB_SERVICE_SCRAPE) {
    console.error('DB_SERVICE_SCRAPE is not defined')
    process.exit(1)
}
const db = await kyselyPostgisMigrate(DB_SERVICE_SCRAPE)
if (db === null) {
    console.error('MIGRATION FAILED')
    process.exit(1)
}
await db.destroy()
