import { DB_SERVICE_SCRAPE } from './src/index.ts'
import { kyselyPostgresMigrate } from './src/migrator.ts'

const db = await kyselyPostgresMigrate(DB_SERVICE_SCRAPE)
await db.destroy()
