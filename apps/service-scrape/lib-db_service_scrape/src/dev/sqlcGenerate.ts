import { execSync } from 'child_process'
import { setupTestPostgisDb } from './setupTestPostgisDb.ts'

const { container, db } = await setupTestPostgisDb()
try {
    execSync(`DATABASE_URL=${container.getConnectionUri()} sqlc generate`)
    console.debug('Generated SQLC code')
} catch {
    console.error('Failed to generate SQLC code')
} finally {
    await db.destroy()
    await container.stop()
}
