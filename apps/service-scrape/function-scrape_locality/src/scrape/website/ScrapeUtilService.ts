import { ILoggable } from '@observability/lib-opentelemetry'
import { load } from 'cheerio'

class ScrapeUtilServiceError extends Error {}

export class ScrapeUtilService extends ILoggable {
    /**
     * @description Extract nicely formatted hydration JSON from <script id="__NEXT_DATA__">
     * @param html
     */
    tryExtractNextJson(args: { html: string }) {
        try {
            const $ = load(args.html)
            const nextJson = $('script[id="__NEXT_DATA__"]').text()

            if (nextJson === '') throw new ScrapeUtilServiceError('Cannot extract Next.js JSON')
            return JSON.parse(nextJson) as object
        } catch (e) {
            this.logException('error', this.tryExtractNextJson, e)
            return null
        }
    }
}
