import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

// Setup persistent resources
import { browserService, LOGGER, scrapeController } from './global/setup'
import { SqsSchema } from '@aws-lambda-powertools/parser/schemas'
import z from 'zod'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)
    const event = SqsSchema.safeParse(_event, { reportInput: true })
    if (!event.success)
        return {
            status: StatusCodes.BAD_REQUEST,
            error: functionHandlerLogger.recordException(event.error),
        }

    const body = z
        .object({
            suburb_name: z.string().transform((val) => val.replaceAll(' ', '-').toLowerCase()),
            state_abbreviation: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
            postcode: z.string().length(4),
        })
        // biome-ignore lint/style/noNonNullAssertion: <should exist>
        .safeParse(JSON.parse(event.data.Records[0]!.body), { reportInput: true })
    if (!body.success)
        return {
            status: StatusCodes.BAD_REQUEST,
            error: functionHandlerLogger.recordException(body.error),
        }
    const locality = {
        suburb: body.data.suburb_name,
        state: body.data.state_abbreviation,
        postcode: body.data.postcode,
    }

    // For testing purposes
    if (locality.postcode === '0000') {
        functionHandlerLogger.recordEnd()
        return { status: StatusCodes.ACCEPTED }
    }

    // Locality data
    const localityId = await scrapeController.tryExtractSuburbPage(locality)
    const extractProfileError = new Error(`Couldn't extract profile: ${JSON.stringify(locality)}`)
    if (localityId === null)
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            error: functionHandlerLogger.recordException(extractProfileError),
        }
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

    // Close browser to prevent ProtocolError - https://github.com/puppeteer/puppeteer/issues/6776
    await browserService.close()
    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})
