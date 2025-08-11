import { describe, expect, it } from 'vitest'
import { getKyselyPostgresDb } from '../src/connection'

describe('postgres connection test', () => {
    it('should be defined for all tests', () => {
        expect(global.db).toBeDefined()
    })

    it('should return null with invalid uri', async () => {
        const db = await getKyselyPostgresDb('invalid uri')
        expect(db).toBeNull()
    })

    it('should return null with inactive uri', async () => {
        const db = await getKyselyPostgresDb('postgresql://user:password@localhost:80/invalid_db')
        expect(db).toBeNull()
    })
})
