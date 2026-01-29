const now = performance.now()
console.info(new Date().toISOString(), 'START scrape node')

import z from 'zod'
import pLimit from 'p-limit'
import { localitySchema } from '@service-scrape/lib-australia_amenity'
import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { browserService } from './global/setup'
import { handler } from './handler'
import { exit } from 'node:process'

const ENV = await parseEnvSchema(
    z.object({
        LOCALITIES: z.string(),
        NODE_OPTIONS: z.string().optional(),
    }),
)

const jsonLocalities = JSON.parse(ENV.LOCALITIES)
const localitiesSchema = z.array(localitySchema)
const localities = localitiesSchema.parse(jsonLocalities, { reportInput: true })

const limit = pLimit(1)
const jobs = localities.map((loc) => limit(() => handler(loc)))
await Promise.all(jobs)

// Do not close browser in container - unnecessary operation
if (!ENV.NODE_OPTIONS) await browserService.close()

const nodeDurationSec = Math.ceil(0.001 * (performance.now() - now))
console.info(new Date().toISOString(), 'END scrape node - duration sec:', nodeDurationSec)

// Explicitly exit process ASAP
exit(0)
