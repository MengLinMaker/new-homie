import { StatusCodes } from 'http-status-codes'

// Setup persistent resources
import { browserService, LOGGER, scrapeController } from './global/setup'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'
import { Locality } from '@service-scrape/lib-australia_amenity'

export const handler = async (args: Locality) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const locality = {
        suburb: args.suburb_name,
        state: args.state_abbreviation,
        postcode: args.postcode,
    }

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
    const localityId = await scrapeController.tryExtractSuburbPage(args)
    if (localityId === null) {
        console.error('FAIL scrapeController.tryExtractSuburbPage')
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            error: functionHandlerLogger.recordException(
                new Error(`Couldn't extract profile: ${JSON.stringify(args)}`),
            ),
        }
    }
    console.info('SUCCESS tryExtractSuburbPage')
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

    // Close browser to prevent ProtocolError - https://github.com/puppeteer/puppeteer/issues/6776
    const browserClosed = await browserService.close()
    if (browserClosed) console.info('SUCCESS browserService.close')
    else {
        console.error('FAIL browserService.close')
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            error: functionHandlerLogger.recordException(
                new Error(`Couldn't browserService.close: ${JSON.stringify(locality)}`),
            ),
        }
    }

    functionHandlerLogger.recordEnd()
    console.info('SUCCESS scrapeController')
    return { status: StatusCodes.OK }
}
