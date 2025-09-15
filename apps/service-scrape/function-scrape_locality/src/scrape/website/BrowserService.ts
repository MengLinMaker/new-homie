import { ILoggable } from '@observability/lib-opentelemetry'
import puppeteer, { type Browser } from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { existsSync } from 'node:fs'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

            // Download chrome at runtime to increase deployment speed
            const s3Client = new S3Client()
            const chromeTarUrl = process.env['CHROME_PUPPETEER_ASSET_URL']
            if (!chromeTarUrl) throw new URIError(`FATAL CHROME_PUPPETEER_ASSET_URL is undefined`)

            const [, bucket, key] = new URL(chromeTarUrl).pathname.split('/')
            const chromeTarSignedUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                    Bucket: bucket,
                    Key: key,
                }),
                { expiresIn: 60 },
            )
            BrowserService.browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath(chromeTarSignedUrl),
            })
            return
        } catch (e) {
            this.logException('fatal', this.launchSingleBrowser, e)
        }
    }

    async getHTML(url: string) {
        await this.launchSingleBrowser()
        // biome-ignore lint/style/noNonNullAssertion: <context should be launched already>
        const page = await BrowserService.browser.browserContexts()[0]!.newPage()
        try {
            // Short timeout to prevent hanging scrapes
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 })
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
