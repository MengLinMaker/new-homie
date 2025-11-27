import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { handler, handlerSchema } from './handler'

const locality = await parseEnvSchema(handlerSchema)
console.info('Scraping locality:', JSON.stringify(locality))
await handler(locality)
