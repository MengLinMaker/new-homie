import { ILoggable } from '@observability/lib-opentelemetry'
import chromiumSetting from '@sparticuz/chromium-min'
import { Browser, BrowserContext, chromium } from 'playwright'
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
            if (BrowserService.browser) return true
            BrowserService.browser = await chromium.launch({ args: chromiumSetting.args })
            BrowserService.browserContext = await BrowserService.browser.newContext()
            return true
        } catch (e) {
            this.logException('fatal', this.launchSingleBrowser, e)
            return false
        }
    }

    async getHTML(url: string) {
        await this.launchSingleBrowser()
        // biome-ignore lint/style/noNonNullAssertion: <context should be launched already>
        const page = await BrowserService.browserContext.newPage()
        try {
            await asyncRetry(
                async () => await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 }),
                {
                    retries: 3,
                },
            )
            const html = await page.content()
            await page.close()
            return html
        } catch (e) {
            try {
                await page.close()
            } catch {}
            this.logExceptionArgs('warn', this.getHTML, url, e)
            return null
        }
    }
}
