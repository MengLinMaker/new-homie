import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { getRuntimeKey } from 'hono/adapter'
import { requestId } from 'hono/request-id'

// Middlewares
export const app = new Hono().use(requestId())

// Routes
app.get('/', (c) => c.json({ message: 'hello world' }))

// Enable AWS Lambda
export const handler = handle(app)

// Serve node in development mode
setImmediate(async () => {
  if (['node'].includes(getRuntimeKey())) {
    const { serve } = await import('@hono/node-server')
    const address = serve({ fetch: app.fetch }).address()
    if (address !== null)
      if (typeof address !== 'string')
        console.info(`App started on: http://localhost:${address.port}`)
  }
})
