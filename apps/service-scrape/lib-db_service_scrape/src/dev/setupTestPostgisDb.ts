import { kyselyPostgisMigrate } from './migrator.ts'
import { postgisTestContainer, type StartedPostgisContainer } from './postgisTestContainer.ts'

/**
 * Quick function for setting up test database
 */
export const setupTestPostgisDb = async () => {
    const container: StartedPostgisContainer = await postgisTestContainer()
    const db = await kyselyPostgisMigrate(container.getConnectionUri())
    if (!db) throw new Error('Test database migration failed')
    return { container, db }
}
