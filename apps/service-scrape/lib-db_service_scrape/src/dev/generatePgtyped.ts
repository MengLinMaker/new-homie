import { execSync } from 'child_process'
import { setupTestPostgisDb } from './setupTestPostgisDb.ts'

const { container, db } = await setupTestPostgisDb()
try {
    execSync(
        `DATABASE_URL=${container.getConnectionUri()} npx pgtyped -w --config ../lib-db_service_scrape/src/dev/pgtyped.json`,
    )
    console.debug('Generated pgtyped queries')
} catch {
    console.error('Failed to generate pgtyped queries')
} finally {
    await db.destroy()
    await container.stop()
}
