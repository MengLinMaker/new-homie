import { enumToArray, Schema } from '@service-scrape/lib-db_service_scrape'
import { validator } from 'hono/validator'
import z from 'zod'
import { LOGGER, otelException, SERVICE_NAME } from './global/otel'
import { StatusCodes } from 'http-status-codes'

const localitySchema = z.object({
    suburb: z.string(),
    state: z.enum(enumToArray(Schema.StateAbbreviationEnum)),
    postcode: z.string().length(4),
})

export const localityValidator = validator('json', (value, c) => {
    const locality = localitySchema.safeParse(value)
    if (!locality.success) {
        LOGGER.fatal(
            otelException(locality.error),
            `${SERVICE_NAME} requires valid locality data in request`,
        )
        return c.text(locality.error.stack ?? locality.error.message, StatusCodes.BAD_REQUEST)
    }
    return locality.data
})
