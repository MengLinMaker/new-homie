import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { excludeLocalitySet } from './exclude-locality'

// Setup OpenTelemetry and connections
import { LOGGER, SERVICE_NAME } from './global/setup'
import { SqsService } from './SqsService'
import { metroPostcode } from './metro-postcodes'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

export const chunkArray = <T>(array: T[], chunkSize: number) => {
    const newArray: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize)
        newArray.push(chunk)
    }
    return newArray
}

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const filteredLocality = australiaLocalities.filter((locality) => {
        if (!locality.postcode) return false
        if (excludeLocalitySet.has(JSON.stringify(locality))) return false
        const postcode = parseInt(locality.postcode, 10)
        return metroPostcode.VIC.includes(postcode)
    })

    const sqsService = new SqsService(LOGGER)
    let failedLocalities: typeof australiaLocalities = []

    for (const chunkLocality of chunkArray(filteredLocality, 10)) {
        const success = await sqsService.sendBatchSQS(chunkLocality)
        if (!success) failedLocalities = failedLocalities.concat(chunkLocality)
    }

    if (failedLocalities.length > 0) {
        throw functionHandlerLogger.recordException(
            `FATAL ${SERVICE_NAME} failed to send ${failedLocalities.length} messages to SQS queue`,
            failedLocalities,
        )
    }
    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})
