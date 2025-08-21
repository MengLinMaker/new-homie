import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'
import { otel } from '@hono/otel'

import { browserService, scrapeController } from './global/setup'

// Run setup for OpenTelemetry
import './global/otel'
import { localityValidator } from './util'
import { StatusCodes } from 'http-status-codes'
import { SERVICE_NAME } from './global/otel'

// Middlewares
const app = new Hono().use(requestId()).use('*', otel())

// Routes
app.post('/', localityValidator, async (c) => {
    const { suburb, state, postcode } = c.req.valid('json')

    const localityId = await scrapeController.tryExtractSuburbPage({ suburb, state, postcode })
    if (localityId === null)
        return c.text(`${SERVICE_NAME} not scrape suburb`, StatusCodes.INTERNAL_SERVER_ERROR)

    await scrapeController.tryExtractSchools({ suburb, state, postcode, localityId })

    for (let page = 1; ; page++) {
        const salesInfo = await scrapeController.tryExtractSalesPage({
            suburb,
            state,
            postcode,
            page,
            localityId,
        })
        if (!salesInfo)
            return c.text(
                `${SERVICE_NAME} not scrape sale listings`,
                StatusCodes.INTERNAL_SERVER_ERROR,
            )
        if (salesInfo.isLastPage) break
    }
    for (let page = 1; ; page++) {
        const rentsInfo = await scrapeController.tryExtractRentsPage({
            suburb,
            state,
            postcode,
            page,
            localityId,
        })
        if (!rentsInfo)
            return c.text(
                `${SERVICE_NAME} not scrape rent listings`,
                StatusCodes.INTERNAL_SERVER_ERROR,
            )
        if (rentsInfo.isLastPage) break
    }

    return c.text('Success', StatusCodes.OK)
})

app.get('/', async (c) => {
    const html = await browserService.getHTML('https://www.google.com.au')
    if (!html)
        return c.text(
            `${SERVICE_NAME} browser failed to boot up`,
            StatusCodes.INTERNAL_SERVER_ERROR,
        )
    return c.html(html, StatusCodes.OK)
})

// Enable AWS Lambda
export const handler = handle(app)

// Export for testing and Vite dev
export default app
