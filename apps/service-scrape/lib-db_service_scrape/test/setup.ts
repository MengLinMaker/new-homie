import { afterAll, beforeAll } from 'vitest'
import { kyselyPostgresMigrate } from '../src/migrator'
import { exec } from 'node:child_process'

declare global {
    var db: Awaited<ReturnType<typeof kyselyPostgresMigrate>>
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

beforeAll(async () => {
    await exec('docker compose up --build -d')
    await sleep(1500)
    const connectionString = 'postgresql://user:password@localhost:54320/db'
    global.db = await kyselyPostgresMigrate(connectionString)
}, 60000)

afterAll(async () => {
    await global.db.destroy()
    await exec('docker compose down -v')
}, 3000)
