import z from 'zod'
import { SqsRecordSchema, SqsSchema } from '@aws-lambda-powertools/parser/schemas'
import { JSONStringified } from '@aws-lambda-powertools/parser/helpers'

const localitySchema = z.object({
    suburb: z.string(),
    state: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
    postcode: z.string().length(4),
})

export const eventSchema = SqsSchema.extend({
    Records: z
        .array(
            SqsRecordSchema.extend({
                body: JSONStringified(localitySchema),
            }),
        )
        .length(1),
})
