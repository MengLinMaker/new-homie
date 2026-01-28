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
    console.info('SUCCESS Start scraping locality', '-', concatLocality(args))
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    if (args.postcode == null || args.state_abbreviation == null || args.suburb_name == null) return

    // For testing purposes
    if (args.postcode === '0000') {
        console.info('ACCEPTED test succeeded')
        functionHandlerLogger.recordEnd()
        return { status: StatusCodes.ACCEPTED }
    }

    // Launch browser
    const browserLaunched = await browserService.launchSingleBrowser()
    if (browserLaunched) console.info('SUCCESS browserService.launchSingleBrowser')
    else {
        console.error('FAIL browserService.launchSingleBrowser')
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
        console.error('FAIL scrapeController.tryExtractLocalityPage')
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            error: functionHandlerLogger.recordException(
                new Error(`Couldn't extract profile: ${JSON.stringify(args)}`),
            ),
        }
    }
    console.info('SUCCESS tryExtractLocalityPage')
    await scrapeController.tryExtractSchools({ ...args, localityId })
    console.info('SUCCESS scrapeController.tryExtractSchools')

    // Sale listing data
    for (let page = 1; ; page++) {
        const salesInfo = await scrapeController.tryExtractSalesPage({ ...args, page, localityId })
        if (!salesInfo || salesInfo.isLastPage) break
        console.info('SUCCESS page', page)
    }
    console.info('SUCCESS scrapeController.tryExtractSalesPage')

    // Rent listing data
    for (let page = 1; ; page++) {
        const rentsInfo = await scrapeController.tryExtractRentsPage({ ...args, page, localityId })
        if (!rentsInfo) break
        if (!rentsInfo || rentsInfo.isLastPage) break
        console.info('SUCCESS page', page)
    }
    console.info('SUCCESS scrapeController.tryExtractRentsPage')

    functionHandlerLogger.recordEnd()
    console.info('SUCCESS Finish scraping locality', '-', concatLocality(args))
    return { status: StatusCodes.OK }
}
