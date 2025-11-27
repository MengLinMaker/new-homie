import { StatusCodes } from 'http-status-codes'

// Setup persistent resources
import { browserService, LOGGER, scrapeController } from './global/setup'
import z from 'zod'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

export const handlerSchema = z.object({
    suburb_name: z.string().transform((val) => val.replaceAll(' ', '-').toLowerCase()),
    state_abbreviation: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
    postcode: z.string().length(4),
})

export const handler = async (args: z.infer<typeof handlerSchema>) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const locality = {
        suburb: args.suburb_name,
        state: args.state_abbreviation,
        postcode: args.postcode,
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
}
