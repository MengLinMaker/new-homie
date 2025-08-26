import type { Logger } from 'pino'
import { ILoggable } from '@observability/lib-opentelemetry'
import { launchChromium } from 'playwright-aws-lambda'
import type { Browser, BrowserContext } from 'playwright'

export class BrowserService extends ILoggable {
    static browser: Browser
    private browserContext

    constructor(logger: Logger, browserContext: BrowserContext) {
        super(logger)
        this.browserContext = browserContext
    }

    /* v8 ignore start */
    static async createBrowserContext() {
        const browser = BrowserService.browser ?? (await launchChromium({ headless: true }))
        const browserContexts = browser.contexts()
        return browserContexts[0] ?? browser.newContext()
    }

    private async singlePage() {
        const pages = this.browserContext.pages()
        return pages[0] ?? (await this.browserContext.newPage())
    }

    async getHTML(url: string) {
        try {
            const page = await this.singlePage()
            await page.goto(url, { waitUntil: 'domcontentloaded' })
            return await page.content()
        } catch (e) {
            this.logException('fatal', e, url)
            return null
        }
    }
}
