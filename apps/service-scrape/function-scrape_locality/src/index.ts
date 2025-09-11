import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

// Setup persistent resources
import { TRACER, scrapeController } from './global/setup'
import { eventSchema } from './global/middleware'
import { spanExceptionEnd } from '@observability/lib-opentelemetry'

export const handler = middy().handler(async (_event, _context) => {
    const event = eventSchema.safeParse(_event, { reportInput: true })
    const span = TRACER.startSpan('handler')
    if (!event.success) throw spanExceptionEnd(span, event.error)

    // biome-ignore lint/style/noNonNullAssertion: <validated>
    const locality = event.data.Records[0]!.body

    // For testing purposes
    if (locality.postcode === '0000') {
        span.end()
        return { status: StatusCodes.ACCEPTED }
    }

    // Locality data
    const localityId = await scrapeController.tryExtractSuburbPage(locality)
    if (localityId === null) return { status: StatusCodes.INTERNAL_SERVER_ERROR }
    await scrapeController.tryExtractSchools({ ...locality, localityId })

    // Sale listing data
    for (let page = 1; ; page++) {
        const args = { ...locality, page, localityId }
        const salesInfo = await scrapeController.tryExtractSalesPage(args)
        if (!salesInfo || salesInfo.isLastPage) break
    }

    // Rent listing data
    for (let page = 1; ; page++) {
        const args = { ...locality, page, localityId }
        const rentsInfo = await scrapeController.tryExtractRentsPage(args)
        if (!rentsInfo) break
        if (!rentsInfo || rentsInfo.isLastPage) break
    }

    span.end()
    return { status: StatusCodes.OK }
})
