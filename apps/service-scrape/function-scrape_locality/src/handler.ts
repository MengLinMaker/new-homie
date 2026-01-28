import { StatusCodes } from 'http-status-codes'

// Setup persistent resources
import { browserService, LOGGER, scrapeController } from './global/setup'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'
import type { Locality } from '@service-scrape/lib-australia_amenity'

const concatLocality = (args: Locality) =>
    `${args.suburb_name}-${args.state_abbreviation}-${args.postcode}`
        .replaceAll(' ', '-')
        .toLowerCase()

export const handler = async (args: Locality) => {
    console.info(new Date().toISOString(), 'SUCCESS Start scraping locality', '-', concatLocality(args))
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    if (args.postcode == null || args.state_abbreviation == null || args.suburb_name == null) return

    // For testing purposes
    if (args.postcode === '0000') {
        console.info(new Date().toISOString(), 'ACCEPTED test succeeded')
        functionHandlerLogger.recordEnd()
        return { status: StatusCodes.ACCEPTED }
    }

    // Launch browser
    const browserLaunched = await browserService.launchSingleBrowser()
    if (browserLaunched) console.info(new Date().toISOString(), 'SUCCESS browserService.launchSingleBrowser')
    else {
        console.error(new Date().toISOString(), 'FAIL browserService.launchSingleBrowser')
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            error: functionHandlerLogger.recordException(
                new Error(`Couldn't browserService.launchSingleBrowser: ${JSON.stringify(args)}`),
            ),
        }
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
    console.info(new Date().toISOString(), 'SUCCESS Finish scraping locality', '-', concatLocality(args))
    return { status: StatusCodes.OK }
}
