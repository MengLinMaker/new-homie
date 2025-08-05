import { load } from 'cheerio'
import { traceTryFunction } from '../instrumentation'

export const scrapeUtil = {
    /**
     * @description Extract nicely formatted hydration JSON from <script id="__NEXT_DATA__">
     * @param html
     */
    tryExtractNextJson(html: string) {
        return traceTryFunction('scrapeUtil.tryExtractNextJson', arguments, 'ERROR', async () => {
            const $ = load(html)
            const nextJson = $('script[id="__NEXT_DATA__"]').text()
            if (nextJson === '') throw Error('Cannot extract Next.js JSON')
            return JSON.parse(nextJson) as object
        })
    },

    /**
     * @returns ISO standard date
     */
    currentDate: () => new Date().toISOString().slice(0, 10),

    /**
     * @description Homes tend to sell at higher price.
     * @returns Integer price
     */
    highestPriceFromString(priceString: string) {
        const prices = priceString
            .replaceAll(/[^0-9^ ^-^$^.]+/g, '') // Expect numbers separated by '_' or ' '
            .matchAll(/[$]( )?\d+/g) // Integer price starts with $, could have a space
            .toArray()
        if (prices.length === 0) return null
        const priceList = prices.map((match) =>
            Number.parseFloat(match.toString().replaceAll('$', '')),
        )
        return Math.max(...priceList)
    },
}
