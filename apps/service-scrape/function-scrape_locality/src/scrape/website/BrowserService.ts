import { ILoggable } from '@observability/lib-opentelemetry'
import chromiumSetting from '@sparticuz/chromium-min'
import { type Browser, type BrowserContext, chromium } from 'playwright'
import asyncRetry from 'async-retry'

/**
 * Launches single browser and context.
 * Create a page for each request, then close
 */
export class BrowserService extends ILoggable {
    private browser: Browser = undefined as never
    private browserContext: BrowserContext = undefined as never

    async close() {
        try {
            await this.browser.close()
            this.browser = undefined as never
            this.browserContext = undefined as never
            return true
        } catch (e) {
            this.logException('fatal', this.close, e)
            return false
        }
    }

    private async singleBrowserContextPage() {
        // Ensure single browser exists in working condition
        if (!this.browser) this.browser = await chromium.launch({ args: chromiumSetting.args })
        if (!this.browser.isConnected())
            this.browser = await chromium.launch({ args: chromiumSetting.args })

        // Ensure single context exists
        const firstContext = this.browser.contexts()[0]
        if (firstContext) this.browserContext = firstContext
        else this.browserContext = await this.browser.newContext()

        // Ensure single page exists
        const firstPage = this.browserContext.pages()[0]
        if (firstPage) return firstPage
        return await this.browserContext.newPage()
    }

    async getHTML(url: string) {
        try {
            const now = performance.now()

            // Retry all flaky Playwright APIs
            const html = await asyncRetry(
                async () => {
                    const page = await this.singleBrowserContextPage()
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 })
                    return await page.content()
                },
                { retries: 3 },
            )

            console.info('Scrape ms:', Math.ceil(performance.now() - now))
            return html
        } catch (e) {
            this.logExceptionArgs('warn', this.getHTML, url, e)
            return null
        }
    }
}
