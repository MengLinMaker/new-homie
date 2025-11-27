import { Hono } from 'hono'
import { handle, type LambdaContext, type LambdaEvent } from 'hono/aws-lambda'
import { OpenAPIHandler } from '@orpc/openapi/fetch'

import { router } from './routes.ts'

export const basePath = '/service-scrape/freemium'
const app = new Hono<{ Bindings: { event: LambdaEvent; lambdaContext: LambdaContext } }>().basePath(
    basePath,
)

const openApiHandler = new OpenAPIHandler(router)

app.use('/*', async (c) => {
    const { matched, response } = await openApiHandler.handle(c.req.raw, {
        prefix: basePath,
        context: { headers: c.req.header() },
    })
    if (matched) return c.newResponse(response.body, response)
    return c.notFound()
})

export const handler = handle(app)
