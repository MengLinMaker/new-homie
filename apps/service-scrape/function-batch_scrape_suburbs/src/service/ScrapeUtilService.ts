import { load } from 'cheerio'
import { IService } from '../global/IService'

export class ScrapeUtilService extends IService {
    /**
     * @description Extract nicely formatted hydration JSON from <script id="__NEXT_DATA__">
     * @param html
     */
    tryExtractNextJson(args: { html: string }) {
        try {
            const $ = load(args.html)
            const nextJson = $('script[id="__NEXT_DATA__"]').text()
            if (nextJson === '') throw Error('Cannot extract Next.js JSON')
            return JSON.parse(nextJson) as object
        } catch (e) {
            this.logException('error', e, args)
            return null
        }
    }
}
