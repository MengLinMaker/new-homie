import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'
import { otelException } from '@observability/lib-opentelemetry'

// Setup persistent resources
import { LOGGER, SERVICE_NAME, scrapeController } from './global/setup'
import { tracerMiddleware, validatorMiddleware } from './global/middleware'

export const handler = middy()
    .use(validatorMiddleware)
    .use(tracerMiddleware)
    .handler(async (event, _context) => {
        LOGGER.info({}, `START ${SERVICE_NAME}`)
        if (!event.success)
            throw LOGGER.fatal(
                {
                    args: event.originalEvent,
                    ...otelException(event.error),
                },
                `FATAL ${SERVICE_NAME} validation error`,
            )

        // biome-ignore lint/style/noNonNullAssertion: <validated>
        const locality = event.data.Records[0]!.body

        // For testing purposes
        if (locality.postcode === '0000') return { status: StatusCodes.ACCEPTED }

        // Locality data
        const localityId = await scrapeController.tryExtractSuburbPage(locality)
        if (localityId === null)
            throw LOGGER.fatal(
                {
                    args: locality,
                },
                `FATAL ${SERVICE_NAME} tryExtractSuburbPage`,
            )

        await scrapeController.tryExtractSchools({ ...locality, localityId })

        // Sale listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const salesInfo = await scrapeController.tryExtractSalesPage(args)
            if (!salesInfo)
                throw LOGGER.fatal({ args }, `FATAL ${SERVICE_NAME} tryExtractSalesPage`)
            if (salesInfo.isLastPage) break
        }

        // Rent listing data
        for (let page = 1; ; page++) {
            const args = { ...locality, page, localityId }
            const rentsInfo = await scrapeController.tryExtractRentsPage(args)
            if (!rentsInfo)
                throw LOGGER.fatal({ args }, `FATAL ${SERVICE_NAME} tryExtractRentsPage`)
            if (rentsInfo.isLastPage) break
        }

        LOGGER.info({ args: locality }, `SUCCESS ${SERVICE_NAME}`)
        return { status: StatusCodes.OK }
    })
