import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'

import './instrumentation'

// Middlewares
export const app = new Hono().use(requestId())

// Routes
app.get('/', (c) => c.json({ message: 'hello world' }))

// Enable AWS Lambda
export const handler = handle(app)
export default app
