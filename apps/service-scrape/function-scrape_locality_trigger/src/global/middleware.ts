import { parser } from '@aws-lambda-powertools/parser/middleware'
import { EventBridgeSchema } from '@aws-lambda-powertools/parser/schemas'

export const validatorMiddleware = parser({
    safeParse: true,
    schema: EventBridgeSchema,
})
