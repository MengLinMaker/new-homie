import { describe, expect, test } from 'vitest'
import { getKyselyPostgresDb } from '../src/kysely'

describe('postgres connection test', () => {
    test('invalid uri should return null', async () => {
        const db = await getKyselyPostgresDb('invalid uri')
        expect(db).toBeNull()
    })

    test('inactive uri should return null', async () => {
        const db = await getKyselyPostgresDb('postgresql://user:password@localhost:80/invalid_db')
        expect(db).toBeNull()
    })
})
