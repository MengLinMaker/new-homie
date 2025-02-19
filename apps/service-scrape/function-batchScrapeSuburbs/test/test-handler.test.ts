import { app } from '../src'
import { describe, it, expect } from 'vitest'

describe('Unit test for app handler', () => {
  it('verifies successful response', async () => {
    const res = await app.request('/', { method: 'GET' })
    expect(res.status).toEqual(200)
    expect(await res.text()).toEqual(
      JSON.stringify({
        message: 'hello world',
      }),
    )
  })
})
