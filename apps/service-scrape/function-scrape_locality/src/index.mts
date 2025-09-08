import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

// Setup persistent resources
import { SERVICE_NAME, TRACER, scrapeController } from './global/setup'
import { tracerMiddleware, validatorMiddleware } from './global/middleware'
import { spanExceptionEnd } from '@observability/lib-opentelemetry'

export const handler = middy()
    .use(validatorMiddleware)
    .use(tracerMiddleware)
    .handler(async (event, _context) => {
        const span = TRACER.startSpan(SERVICE_NAME)
        if (!event.success) throw spanExceptionEnd(span, `FATAL ${SERVICE_NAME} validation error`)

        // biome-ignore lint/style/noNonNullAssertion: <validated>
        const locality = event.data.Records[0]!.body

        // For testing purposes
        if (locality.postcode === '0000') {
            span.end()
            return { status: StatusCodes.ACCEPTED }
        }

        // Locality data
        const localityId = await scrapeController.tryExtractSuburbPage(locality)
        if (localityId === null)
            throw spanExceptionEnd(span, `FATAL ${SERVICE_NAME} tryExtractSuburbPage`)
        await scrapeController.tryExtractSchools({ ...locality, localityId })

        // Sale listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const salesInfo = await scrapeController.tryExtractSalesPage(args)
            if (!salesInfo)
                throw spanExceptionEnd(span, `FATAL ${SERVICE_NAME} tryExtractSalesPage`)
            if (salesInfo.isLastPage) break
        }

        // Rent listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const rentsInfo = await scrapeController.tryExtractRentsPage(args)
            if (!rentsInfo)
                throw spanExceptionEnd(span, `FATAL ${SERVICE_NAME} tryExtractRentsPage`)
            if (rentsInfo.isLastPage) break
        }

        span.end()
        return { status: StatusCodes.OK }
    })
