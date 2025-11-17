import { Hono } from 'hono'
import { handle, type LambdaContext, type LambdaEvent } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'
import { otel } from '@hono/otel'
import { cors } from 'hono/cors'

export const basePath = '/service-scrape/query/freemium'
const app = new Hono<{
    Bindings: {
        event: LambdaEvent
        lambdaContext: LambdaContext
    }
}>()
    .basePath(basePath)
    .use(requestId())
    .use(otel())
    .use(cors())

app.get('/hello', (c) => {
    console.log('Hello Hono!')
    return c.text('Hello Hono!')
})

export const handler = handle(app)
