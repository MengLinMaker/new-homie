import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'
import { otel } from '@hono/otel'

import { scrapeController } from './global/setup'

// Run setup for OpenTelemetry
import './global/otel'
import { localityValidator } from './util'
import { StatusCodes } from 'http-status-codes'
import { SERVICE_NAME } from './global/otel'

// Middlewares
const app = new Hono().use(requestId()).use('*', otel())

// Routes
app.post('/', localityValidator, async (c) => {
    const locality = c.req.valid('json')

    const suburbInfo = await scrapeController.tryExtractSuburbPage(locality)
    if (suburbInfo)
        return c.text(`${SERVICE_NAME} not scrape suburb`, StatusCodes.INTERNAL_SERVER_ERROR)

    for (let page = 1; ; page++) {
        const salesInfo = await scrapeController.tryExtractSalesPage({ ...locality, page })
        if (!salesInfo)
            return c.text(
                `${SERVICE_NAME} not scrape sale listings`,
                StatusCodes.INTERNAL_SERVER_ERROR,
            )
        if (salesInfo.isLastPage) break
    }
    for (let page = 1; ; page++) {
        const rentsInfo = await scrapeController.tryExtractRentsPage({ ...locality, page })
        if (!rentsInfo)
            return c.text(
                `${SERVICE_NAME} not scrape rent listings`,
                StatusCodes.INTERNAL_SERVER_ERROR,
            )
        if (rentsInfo.isLastPage) break
    }

    return c.text('Success')
})

app.get('/', async (c) => {
    return c.text(`${SERVICE_NAME} is available`, StatusCodes.OK)
})

// Enable AWS Lambda
export const handler = handle(app)

// Export for testing and Vite dev
export default app
