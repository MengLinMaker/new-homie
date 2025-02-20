import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'

import './instrumentation'

import { traceTryFunction } from './instrumentation'

// Middlewares
export const app = new Hono().use(requestId())

function addition(a: number, b: number) {
  return traceTryFunction('addition', arguments, 'ERROR', async () => {
    if (Math.random() < 0.5) throw Error('wrong')
    return a + b
  })
}

// Routes
app.get('/', async (c) => {
  await (function helloWrapper() {
    return traceTryFunction('helloWrapper', arguments, 'ERROR', async () => {
      await addition(1, 2)
      return 'hello'
    })
  })()

  return c.json({ message: 'hello world' })
})

// Enable AWS Lambda
export const handler = handle(app)
export default app
