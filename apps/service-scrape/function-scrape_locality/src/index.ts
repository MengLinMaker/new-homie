import { parseEnvSchema } from '@observability/lib-opentelemetry'
import { handler, handlerSchema } from './handler'

const locality = await parseEnvSchema(handlerSchema)
await handler(locality)
