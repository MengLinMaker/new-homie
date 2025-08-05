import { describe, expect, it } from 'vitest'
import { scrapeUtil } from '../../src/scrape/scrapeUtil'

describe('scrapeUtil', () => {
    describe('tryExtractNextJson', () => {
        it('should parse next.js html successfully', async () => {
            const expectedObject = {
                props: {
                    pageProps: {},
                },
                page: '/',
                query: {},
                buildId: 'IBYL2BqUkq9CXKP4X3m2r',
                nextExport: true,
                autoExport: true,
                isFallback: false,
                scriptLoader: [],
            }
            const [resultObject, success] = await scrapeUtil.tryExtractNextJson(
                `<html><script id="__NEXT_DATA__">${JSON.stringify(expectedObject)}</script></html>`,
            )
            expect(success).toBe(true)
            expect(resultObject).toStrictEqual(expectedObject)
        })

        it('should not parse invalid html', async () => {
            const [result, success] = await scrapeUtil.tryExtractNextJson(
                '<html><script></script></html>',
            )
            expect(success).toBe(false)
            expect(result).toBeInstanceOf(Error)
        })
    })
})
