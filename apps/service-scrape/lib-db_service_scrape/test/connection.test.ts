import { describe, expect, it } from 'vitest'
import { getKyselyPostgresDb } from '../src/connection'

describe('getKyselyPostgresDb', () => {
    const invalidUri = 'invalidUri'
    const inactiveUri = 'postgresql://user:password@localhost:80/invalid_db'

    it('should return null with invalid uri', async () => {
        const db = await getKyselyPostgresDb(invalidUri)
        expect(db).toBeNull()
    })

    it('should return null with inactive uri', async () => {
        const db = await getKyselyPostgresDb(inactiveUri)
        expect(db).toBeNull()
    })
})
