import { kyselyPostgisMigrate } from './migrator.ts'
import { postgisTestContainer } from './postgisTestContainer.ts'

/**
 * Quick function for setting up test database
 */
export const setupTestPostgisDb = async () => {
    const container = await postgisTestContainer()
    const db = await kyselyPostgisMigrate(container.getConnectionUri())
    if (!db) throw new Error('Test database migration failed')
    return { container, db }
}
