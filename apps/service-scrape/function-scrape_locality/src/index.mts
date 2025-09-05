import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

// Setup persistent resources
import { scrapeController } from './global/setup'
import { tracerMiddleware, validatorMiddleware } from './global/middleware'
import { LOGGER, otelException } from '@observability/lib-opentelemetry'

export const handler = middy()
    .use(validatorMiddleware)
    .use(tracerMiddleware)
    .handler(async (event, _context) => {
        if (!event.success) {
            LOGGER.fatal({
                args: event.originalEvent,
                ...otelException(event.error),
            })
            return { status: StatusCodes.BAD_REQUEST }
        }
        // biome-ignore lint/style/noNonNullAssertion: <validated>
        const locality = event.data.Records[0]!.body

        // For testing purposes
        if (locality.postcode === '0000') return { status: StatusCodes.ACCEPTED }

        // Locality data
        const localityId = await scrapeController.tryExtractSuburbPage(locality)
        if (localityId === null) return { status: StatusCodes.INTERNAL_SERVER_ERROR }

        await scrapeController.tryExtractSchools({ ...locality, localityId })

        // Sale listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const salesInfo = await scrapeController.tryExtractSalesPage(args)
            if (!salesInfo) return { status: StatusCodes.INTERNAL_SERVER_ERROR }
            if (salesInfo.isLastPage) break
        }

        // Rent listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const rentsInfo = await scrapeController.tryExtractRentsPage(args)
            if (!rentsInfo) return { status: StatusCodes.INTERNAL_SERVER_ERROR }
            if (rentsInfo.isLastPage) break
        }

        return { status: StatusCodes.OK }
    })
