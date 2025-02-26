import { load } from 'cheerio'
import { traceTryFunction } from '../instrumentation'

export const scrapeUtil = {
  /**
   * Extract nicely formatted hydration JSON from <script id="__NEXT_DATA__">
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
}
