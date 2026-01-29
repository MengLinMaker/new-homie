const now = performance.now()
console.info(new Date().toISOString(), 'START scrape node')

import z from 'zod'
import { localitySchema } from '@service-scrape/lib-australia_amenity'
import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { browserService } from './global/setup'
import { handler } from './handler'

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

try {
    await browserService.close()
} catch {}

const nodeDurationSec = Math.ceil(0.001 * (performance.now() - now))
console.info(new Date().toISOString(), 'END scrape node - duration sec:', nodeDurationSec)
