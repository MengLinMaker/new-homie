import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

// Setup persistent resources
import { TRACER, scrapeController } from './global/setup'
import { spanExceptionEnd } from '@observability/lib-opentelemetry'
import { SqsSchema } from '@aws-lambda-powertools/parser/schemas'
import z from 'zod'

export const handler = middy().handler(async (_event, _context) => {
    const event = SqsSchema.safeParse(_event, { reportInput: true })
    const span = TRACER.startSpan('handler')
    if (!event.success) throw spanExceptionEnd(span, event.error)

    const body = z
        .object({
            suburb_name: z.string(),
            state_abbreviation: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
            postcode: z.string().length(4),
        })
        // biome-ignore lint/style/noNonNullAssertion: <should exist>
        .safeParse(JSON.parse(event.data.Records[0]!.body), { reportInput: true })
    if (!body.success) throw spanExceptionEnd(span, body.error)
    const locality = {
        suburb: body.data.suburb_name,
        state: body.data.state_abbreviation,
        postcode: body.data.postcode,
    }

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
