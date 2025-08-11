import { describe, expect, it } from 'vitest'
import { kyselyPostgisGenerateSchema } from '../src/dev/generator'
import { kyselyPostgisMigrate } from '../src/dev/migrator'

describe('developer tools', () => {
    const invalidUri = 'invalidUri'
    const inactiveUri = 'postgresql://user:password@localhost:80/invalid_db'

    describe('kyselyPostgisGenerateSchema', () => {
        it('should fail with invalidUri uri', async () => {
            const success = await kyselyPostgisGenerateSchema(invalidUri)
            expect(success).toBeFalsy()
        })

        it('should fail with inactive uri', async () => {
            const success = await kyselyPostgisGenerateSchema(inactiveUri)
            expect(success).toBeFalsy()
        })
    })

    describe('kyselyPostgisMigrate', () => {
        it('should fail with invalidUri uri', async () => {
            const db = await kyselyPostgisMigrate(invalidUri)
            expect(db).toBeNull()
        })

        it('should fail with inactive uri', async () => {
            const db = await kyselyPostgisMigrate(inactiveUri)
            expect(db).toBeNull()
        })
    })
})
