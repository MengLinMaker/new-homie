import { localitySchema } from '@service-scrape/lib-australia_amenity'
import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { handler } from './handler'
import z from 'zod'

const ENV = await parseEnvSchema(
    z.object({
        LOCALITIES: z.string(),
    }),
)

const jsonLocalities = JSON.parse(ENV.LOCALITIES)
const localitiesSchema = z.array(localitySchema)
const localities = localitiesSchema.parse(jsonLocalities, { reportInput: true })

for (const locality of localities) await handler(locality)
