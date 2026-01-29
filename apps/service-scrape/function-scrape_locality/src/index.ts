const now = performance.now()
console.info(new Date().toISOString(), 'START scrape node')

import z from 'zod'
import { localitySchema } from '@service-scrape/lib-australia_amenity'
import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { browserService } from './global/setup'
import { handler } from './handler'
import { execSync } from 'node:child_process'
import { exit } from 'node:process'

const ENV = await parseEnvSchema(
    z.object({
        LOCALITIES: z.string(),
        MANAGED_BY_AWS: z.string().optional(),
    }),
)

const jsonLocalities = JSON.parse(ENV.LOCALITIES)
const localitiesSchema = z.array(localitySchema)
const localities = localitiesSchema.parse(jsonLocalities, { reportInput: true })

for (const loc of localities) {
    await handler(loc)
}

const nodeDurationSec = Math.ceil(0.001 * (performance.now() - now))
console.info(new Date().toISOString(), 'END scrape node - duration sec:', nodeDurationSec)

if (ENV.MANAGED_BY_AWS !== undefined) {
    execSync('pkill -9 playwright')
    execSync('pkill -9 chromium')
    execSync('pkill node')
    exit(0)
}

try {
    await browserService.close()
} catch {}
