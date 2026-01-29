const now = performance.now()
console.info(new Date().toISOString(), 'START scrape node')

import z from 'zod'
import pLimit from 'p-limit'
import { localitySchema } from '@service-scrape/lib-australia_amenity'
import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { browserService } from './global/setup'
import { handler } from './handler'
import { exit, kill } from 'node:process'

const ENV = await parseEnvSchema(
    z.object({
        LOCALITIES: z.string(),
        MANAGED_BY_AWS: z.string().optional(),
    }),
)

const jsonLocalities = JSON.parse(ENV.LOCALITIES)
const localitiesSchema = z.array(localitySchema)
const localities = localitiesSchema.parse(jsonLocalities, { reportInput: true })

const limit = pLimit(1)
const jobs = localities.map((loc) => limit(() => handler(loc)))
await Promise.all(jobs)

const nodeDurationSec = Math.ceil(0.001 * (performance.now() - now))
console.info(new Date().toISOString(), 'END scrape node - duration sec:', nodeDurationSec)

// Exit as ASAP in AWS
if (ENV.MANAGED_BY_AWS !== undefined) {
    kill(1, 'SIGTERM')
    exit(0)
}

await browserService.close()

