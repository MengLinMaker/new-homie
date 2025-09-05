import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'
import { otel } from '@hono/otel'

import { createServer } from 'node:http'
import { StatusCodes } from 'http-status-codes'
import { ValidationError } from 'common-errors'

// Setup persistent resources
import { browserService, scrapeController, SERVICE_NAME } from './global/setup'
import { localityValidator } from './global/util'

// Middlewares
const app = new Hono().use(requestId()).use('*', otel())

// Routes
app.post('/', localityValidator, async (c) => {
    const locality = c.req.valid('json')

    // Locality data
    const localityId = await scrapeController.tryExtractSuburbPage(locality)
    if (localityId === null)
        throw new ValidationError(`${SERVICE_NAME} couldn't scrape locality - ${locality}`)

    await scrapeController.tryExtractSchools({ ...locality, localityId })

    // Sale listing data
    for (let page = 1; ; page++) {
        const args = { ...locality, page, localityId }
        const salesInfo = await scrapeController.tryExtractSalesPage(args)
        if (!salesInfo)
            throw new ValidationError(`${SERVICE_NAME} couldn't scrape sale listing - ${args}`)
        if (salesInfo.isLastPage) break
    }

    // Rent listing data
    for (let page = 1; ; page++) {
        const args = { ...locality, page, localityId }
        const rentsInfo = await scrapeController.tryExtractRentsPage(args)
        if (!rentsInfo)
            throw new ValidationError(`${SERVICE_NAME} couldn't scrape rent listing - ${args}`)
        if (rentsInfo.isLastPage) break
    }

    return c.json(locality, StatusCodes.OK)
})

// Test url - test webscraping with local server
app.get('/test', async (c) => {
    const server = createServer((_req, res) => {
        res.end('<h1>Hello</h1>')
    })
    const hostname = '127.0.0.1'
    const port = 8765
    const serverInstance = server.listen(port, hostname)
    const testUrl = `http://${hostname}:${port}`

    try {
        let scrapeTimeMs = performance.now()

        const html = await browserService.getHTML(testUrl)

        scrapeTimeMs = Math.ceil(performance.now() - scrapeTimeMs)
        serverInstance.close()
        return c.json({ scrapeTimeMs, html }, StatusCodes.OK)
    } catch (e) {
        serverInstance.close()
        return c.json({ error: e }, StatusCodes.INTERNAL_SERVER_ERROR)
    }
})

// Handler or AWS Lambda
export const handler = handle(app)

// Export for Vite dev server
export default app
