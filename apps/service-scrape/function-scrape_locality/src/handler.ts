import { StatusCodes } from 'http-status-codes'

// Setup persistent resources
import { LOGGER, scrapeController } from './global/setup'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'
import type { Locality } from '@service-scrape/lib-australia_amenity'
import { CURRENT_LOCALITY, localityString } from './scrape/global'

export const handler = async (args: Locality) => {
    // Set global variables for debug logging
    const locString = localityString(args)
    CURRENT_LOCALITY.locality = args
    CURRENT_LOCALITY.localityUrl = `https://www.domain.com.au/suburb-profile/${locString}`
    CURRENT_LOCALITY.saleUrl = `https://www.domain.com.au/sale/${locString}`
    CURRENT_LOCALITY.rentUrl = `https://www.domain.com.au/rent/${locString}`

    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)
    console.info(`${new Date().toISOString()} START scraping - ${locString}`)

    // For testing purposes
    if (!args.postcode || !args.state_abbreviation || !args.suburb_name)
        return { status: StatusCodes.ACCEPTED }
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
    await scrapeController.tryExtractSchools({ ...args, localityId })
    console.info(new Date().toISOString(), 'SUCCESS tryExtractLocalityPage')

    // Sale listing data
    for (let page = 1; ; page++) {
        const salesInfo = await scrapeController.tryExtractSalesPage({ ...args, page, localityId })
        if (!salesInfo) break
        console.info(new Date().toISOString(), 'SUCCESS scrapeController.tryExtractSalesPage', page)
        if (salesInfo.isLastPage) break
    }

    // Rent listing data
    for (let page = 1; ; page++) {
        const rentsInfo = await scrapeController.tryExtractRentsPage({ ...args, page, localityId })
        if (!rentsInfo) break
        console.info(new Date().toISOString(), 'SUCCESS scrapeController.tryExtractRentsPage', page)
        if (rentsInfo.isLastPage) break
    }

    const faasMs = functionHandlerLogger.recordEnd()
    const faasSec = Math.ceil(0.001 * faasMs)
    console.info(`${new Date().toISOString()} END scraping - ${locString} - ${faasSec} sec\n`)
    return { status: StatusCodes.OK }
}
