import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

// Setup persistent resources
import { SERVICE_NAME, TRACER, logLambdaException, scrapeController } from './global/setup'
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
        if (localityId === null) {
            logLambdaException(`FATAL ScrapeController.tryExtractSuburbPage falied`, locality)
            return { status: StatusCodes.INTERNAL_SERVER_ERROR }
        }
        await scrapeController.tryExtractSchools({ ...locality, localityId })

        // Sale listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const salesInfo = await scrapeController.tryExtractSalesPage(args)
            if (!salesInfo) {
                logLambdaException(`FATAL ScrapeController.tryExtractSalesPage falied`, args)
                break
            }
            if (salesInfo.isLastPage) break
        }

        // Rent listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const rentsInfo = await scrapeController.tryExtractRentsPage(args)
            if (!rentsInfo) {
                logLambdaException(`FATAL ScrapeController.tryExtractRentsPage falied`, args)
                break
            }
            if (rentsInfo.isLastPage) break
        }

        span.end()
        return { status: StatusCodes.OK }
    })
