import { enumToArray, Schema } from '@service-scrape/lib-db_service_scrape'
import z from 'zod'
import { SERVICE_NAME } from './setup'

import { parser } from '@aws-lambda-powertools/parser/middleware'
import { SqsRecordSchema, SqsSchema } from '@aws-lambda-powertools/parser/schemas'
import { JSONStringified } from '@aws-lambda-powertools/parser/helpers'

const localitySchema = z.object({
    suburb: z.string(),
    state: z.enum(enumToArray(Schema.StateAbbreviationEnum)),
    postcode: z.string().length(4),
})

export const validatorMiddleware = parser({
    safeParse: true,
    schema: SqsSchema.extend({
        Records: z
            .array(
                SqsRecordSchema.extend({
                    body: JSONStringified(localitySchema),
                }),
            )
            .length(1),
    }),
})

import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
export const tracerMiddleware = captureLambdaHandler(tracer)
