import { ILoggable } from '@observability/lib-opentelemetry'
import puppeteer, { type Browser } from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { existsSync } from 'node:fs'
import asyncRetry from 'async-retry'

/**
 * Launches single browser and context.
 * Create a page for each request, then close
 */
export class BrowserService extends ILoggable {
    private static browser: Browser

    async close() {
        await BrowserService.browser.close()
        BrowserService.browser = undefined as never
    }

    private async launchSingleBrowser() {
        try {
            if (BrowserService.browser) return

            // Local chrome execution
            if (existsSync('./.puppeteer')) {
                BrowserService.browser = await puppeteer.launch({
                    args: chromium.args,
                    executablePath: './.puppeteer/chrome-headless-shell',
                })
                return
            }

            // Arm64 docker chrome execution
            const prebuiltChromeBinaryPath = '/usr/bin/headless-chromium'
            if (existsSync(prebuiltChromeBinaryPath)) {
                BrowserService.browser = await puppeteer.launch({
                    args: chromium.args,
                    executablePath: await chromium.executablePath(prebuiltChromeBinaryPath),
                })
                return
            }
        } catch (e) {
            this.logException('fatal', this.launchSingleBrowser, e)
        }
    }

    async getHTML(url: string) {
        await this.launchSingleBrowser()
        // biome-ignore lint/style/noNonNullAssertion: <context should be launched already>
        const page = await BrowserService.browser.browserContexts()[0]!.newPage()
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
            await page.close()
            this.logExceptionArgs('warn', this.getHTML, url, e)
            return null
        }
    }
}
