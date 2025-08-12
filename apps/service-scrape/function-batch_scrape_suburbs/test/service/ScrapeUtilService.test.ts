import { describe, expect, it } from 'vitest'
import { ScrapeUtilService } from '../../src/service/ScrapeUtilService'
import { LOGGER } from '../util'

describe('ScrapeUtilService', () => {
    const scrapeUtilService = new ScrapeUtilService(LOGGER)

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
            const resultObject = scrapeUtilService.tryExtractNextJson({
                html: `<html><script id="__NEXT_DATA__">${JSON.stringify(expectedObject)}</script></html>`,
            })
            expect(resultObject).toStrictEqual(expectedObject)
        })

        it('should not parse invalid html', async () => {
            const result = scrapeUtilService.tryExtractNextJson({
                html: '<html><script></script></html>',
            })
            expect(result).toBeNull()
        })
    })
})
