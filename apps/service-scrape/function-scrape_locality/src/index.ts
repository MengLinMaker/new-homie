import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { localitySchema } from '@service-scrape/lib-australia_amenity'
import { handler } from './handler'

const locality = await parseEnvSchema(localitySchema)
console.info('Scraping locality:', JSON.stringify(locality))
await handler(locality)
