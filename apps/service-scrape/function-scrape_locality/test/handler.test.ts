import { afterAll, describe, expect, it } from 'vitest'
import { StatusCodes } from 'http-status-codes'

describe.skip('handler', async () => {
    const { handler } = await import('../src/handler')
    const { browserService } = await import('../src/global/setup')
    afterAll(async () => await browserService.close())

    it('Should invalidate incorrect input', async () => {
        const locality = {
            suburb_name: 'TEST',
            state_abbreviation: 'TEST',
            postcode: 'TEST',
        }
        const res = await handler(locality as never)
        expect(res.status).toStrictEqual(StatusCodes.BAD_REQUEST)
    })

    it('Should parse correct input', async () => {
        const locality = {
            suburb_name: 'Test',
            state_abbreviation: 'VIC' as const,
            postcode: '0000',
        }
        const res = await handler(locality)
        expect(res.status).toStrictEqual(StatusCodes.ACCEPTED)
    })

    it(
        'Should scrape real data',
        async () => {
            const locality = {
                suburb_name: 'Dandenong',
                state_abbreviation: 'VIC' as const,
                postcode: '3175',
            }
            const res = await handler(locality)
            expect(res.status).toStrictEqual(StatusCodes.OK)
        },
        900 * 1000,
    )
})
