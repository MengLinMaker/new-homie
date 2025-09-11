import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { validatorMiddleware } from './global/middleware'

// Setup OpenTelemetry and connections
import { LOGGER, SERVICE_NAME, TRACER } from './global/setup'
import { spanExceptionEnd } from '@observability/lib-opentelemetry'
import { SqsService } from './SqsService'

export const chunkArray = <T>(array: T[], chunkSize: number) => {
    const newArray: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize)
        newArray.push(chunk)
    }
    return newArray
}

export const handler = middy()
    .use(validatorMiddleware)
    .handler(async (event, _context) => {
        const span = TRACER.startSpan('handler')
        if (!event.success) throw spanExceptionEnd(span, `FATAL ${SERVICE_NAME} validation error`)

        const filteredLocality = australiaLocalities.filter((locality) => {
            if (!locality.postcode) return false
            const postcode = parseInt(locality.postcode, 10)
            return postcode >= 3170 && postcode <= 3180
        })

        const sqsService = new SqsService(LOGGER)
        let failedLocalities: typeof australiaLocalities = []

        for (const chunkLocality of chunkArray(filteredLocality, 10)) {
            const success = sqsService.sendBatchSQS(chunkLocality)
            if (!success) failedLocalities = failedLocalities.concat(failedLocalities)
        }

        if (failedLocalities.length > 0) {
            throw spanExceptionEnd(span, `FATAL ${SERVICE_NAME} partial failure send to SQS queue`)
        }
        span.end()
        return { status: StatusCodes.OK }
    })
