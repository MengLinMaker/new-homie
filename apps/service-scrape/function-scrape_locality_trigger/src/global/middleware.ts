import { parser } from '@aws-lambda-powertools/parser/middleware'
import { EventBridgeSchema } from '@aws-lambda-powertools/parser/schemas'
import { SERVICE_NAME } from './setup'

export const validatorMiddleware = parser({
    safeParse: true,
    schema: EventBridgeSchema,
})

import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
export const tracerMiddleware = captureLambdaHandler(tracer)
