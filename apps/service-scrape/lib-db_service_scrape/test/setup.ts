import { afterAll, beforeAll } from 'vitest'
import { exec } from 'node:child_process'
import type { Kysely } from 'kysely'

import { kyselyPostgresMigrate } from '../src/migrator'
import { getKyselyPostgresDb } from '../src/connection'
import type { DB } from '../src/schema'

declare global {
    var db: Kysely<DB>
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const connectionString = 'postgresql://user:password@localhost:54320/db'

beforeAll(async () => {
    await exec('docker compose up --build -d')

    let db: null | Kysely<DB> = null
    while (!db) {
        await sleep(100)
        db = await getKyselyPostgresDb(connectionString)
    }
    db.destroy()
    db = await kyselyPostgresMigrate(connectionString)
    if (!db) {
        throw new Error('Test database migration failed')
    }
    global.db = db
}, 60000)

afterAll(async () => {
    await global.db.destroy()
})
