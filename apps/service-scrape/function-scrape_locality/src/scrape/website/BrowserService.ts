import { ILoggable } from '@observability/lib-opentelemetry'
import chromiumSetting from '@sparticuz/chromium-min'
import { type Browser, type BrowserContext, chromium } from 'playwright'
import asyncRetry from 'async-retry'

/**
 * Launches single browser and context.
 * Create a page for each request, then close
 */
export class BrowserService extends ILoggable {
    private static browser: Browser
    private static browserContext: BrowserContext

    async close() {
        try {
            await BrowserService.browser.close()
            BrowserService.browser = undefined as never
            return true
        } catch (e) {
            this.logException('fatal', this.close, e)
            return false
        }
    }

    async launchSingleBrowser() {
        try {
            if (!BrowserService.browser)
                BrowserService.browser = await chromium.launch({ args: chromiumSetting.args })
            if (!BrowserService.browser.isConnected())
                BrowserService.browser = await chromium.launch({ args: chromiumSetting.args })
            if (!BrowserService.browserContext)
                BrowserService.browserContext = await BrowserService.browser.newContext()
            return true
        } catch (e) {
            this.logException('fatal', this.launchSingleBrowser, e)
            return false
        }
    }

    async getHTML(url: string) {
        try {
            await this.launchSingleBrowser()
            const now = performance.now()
            const page = await BrowserService.browserContext.newPage()
            await asyncRetry(
                async () => {
                    await this.launchSingleBrowser()
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 })
                },
                { retries: 3 },
            )
            const html = await page.content()
            await page.close()
            console.info('Scrape ms:', Math.ceil(performance.now() - now))
            return html
        } catch (e) {
            this.logExceptionArgs('warn', this.getHTML, url, e)
            return null
        }
    }
}
