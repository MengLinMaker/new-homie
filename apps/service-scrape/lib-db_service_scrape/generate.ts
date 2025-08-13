import { setupTestPostgisDb } from './src/dev/setupTestPostgisDb.ts'
import { kyselyPostgisGenerateSchema } from './src/dev/generator.ts'

const { container, db } = await setupTestPostgisDb()
const generateSuccess = await kyselyPostgisGenerateSchema(container.getConnectionUri())
if (!generateSuccess) {
    await db.destroy()
    await container.stop()
    throw new Error('Test database code generation failed')
}
await db.destroy()
await container.stop()
