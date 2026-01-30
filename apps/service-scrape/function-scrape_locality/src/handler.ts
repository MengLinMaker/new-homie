import { StatusCodes } from 'http-status-codes'

// Setup persistent resources
import { LOGGER, scrapeController } from './global/setup'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'
import type { Locality } from '@service-scrape/lib-australia_amenity'

const concatLocality = (args: Locality) =>
    `${args.suburb_name}-${args.state_abbreviation}-${args.postcode}`
        .replaceAll(' ', '-')
        .toLowerCase()

export const handler = async (args: Locality) => {
    const now = performance.now()

    console.info(
        `${new Date().toISOString()} SUCCESS Start scraping locality - ${concatLocality(args)}`,
    )
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    if (!args.postcode || !args.state_abbreviation || !args.suburb_name)
        return { status: StatusCodes.ACCEPTED }

    // For testing purposes
    if (args.postcode === '0000') {
        console.info(new Date().toISOString(), 'ACCEPTED test succeeded')
        functionHandlerLogger.recordEnd()
        return { status: StatusCodes.ACCEPTED }
    }

    // Locality data
    const localityId = await scrapeController.tryExtractLocalityPage(args)
    if (localityId === null) {
        console.error(new Date().toISOString(), 'FAIL scrapeController.tryExtractLocalityPage')
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            error: functionHandlerLogger.recordException(
                new Error(`Couldn't extract profile: ${JSON.stringify(args)}`),
            ),
        }
    }
    console.info(new Date().toISOString(), 'SUCCESS tryExtractLocalityPage')
    await scrapeController.tryExtractSchools({ ...args, localityId })
    console.info(new Date().toISOString(), 'SUCCESS scrapeController.tryExtractSchools')

    // Sale listing data
    for (let page = 1; ; page++) {
        const salesInfo = await scrapeController.tryExtractSalesPage({ ...args, page, localityId })
        if (!salesInfo || salesInfo.isLastPage) break
        console.info(new Date().toISOString(), 'SUCCESS page', page)
    }
    console.info(new Date().toISOString(), 'SUCCESS scrapeController.tryExtractSalesPage')

    // Rent listing data
    for (let page = 1; ; page++) {
        const rentsInfo = await scrapeController.tryExtractRentsPage({ ...args, page, localityId })
        if (!rentsInfo) break
        if (!rentsInfo || rentsInfo.isLastPage) break
        console.info(new Date().toISOString(), 'SUCCESS page', page)
    }
    console.info(new Date().toISOString(), 'SUCCESS scrapeController.tryExtractRentsPage')

    functionHandlerLogger.recordEnd()
    console.info(
        `${new Date().toISOString()} SUCCESS Finish scraping locality - ${concatLocality(args)} - ${Math.ceil(0.001 * (performance.now() - now))} sec\n`,
    )
    return { status: StatusCodes.OK }
}
