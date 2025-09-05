import { enumToArray, Schema } from '@service-scrape/lib-db_service_scrape'
import { validator } from 'hono/validator'
import z from 'zod'
import { LOGGER, otelException } from '@observability/lib-opentelemetry'
import { SERVICE_NAME } from './setup'

const localitySchema = z.object({
    suburb: z.string(),
    state: z.enum(enumToArray(Schema.StateAbbreviationEnum)),
    postcode: z.string().length(4),
})

export const localityValidator = validator('json', (value) => {
    const locality = localitySchema.safeParse(value)
    if (!locality.success) {
        LOGGER.fatal(
            otelException(locality.error),
            `${SERVICE_NAME} requires valid locality data in request`,
        )
        throw locality.error
    }
    return locality.data
})
