import type { Logger } from 'pino'
import { ILoggable } from '@observability/lib-opentelemetry'
import puppeteer, { type BrowserContext, type Browser } from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { existsSync } from 'node:fs'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
export class BrowserService extends ILoggable {
    static browser: Browser
    private browserContext

    constructor(logger: Logger, browserContext: BrowserContext) {
        super(logger)
        this.browserContext = browserContext
    }

    /* v8 ignore start */
    static async launchBrowser() {
        if (BrowserService.browser) return BrowserService.browser

        // Local chrome execution
        if (existsSync('./.puppeteer'))
            return await puppeteer.launch({
                args: chromium.args,
                executablePath: './.puppeteer/chrome-headless-shell',
            })

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
        return await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(chromeTarSignedUrl),
        })
    }

    /* v8 ignore start */
    static async createBrowserContext() {
        const browser = await BrowserService.launchBrowser()
        BrowserService.browser = browser
        const browserContexts = browser.browserContexts()
        return browserContexts[0] ?? browser.createBrowserContext()
    }

    /* v8 ignore start */
    static async close() {
        BrowserService.browser.close()
    }

    private async singlePage() {
        const pages = await this.browserContext.pages()
        return pages[0] ?? (await this.browserContext.newPage())
    }

    async getHTML(url: string) {
        try {
            const page = await this.singlePage()
            await page.goto(url, { waitUntil: 'domcontentloaded' })
            return await page.content()
        } catch (e) {
            this.logExceptionArgs('warn', this.getHTML, url, e)
            return null
        }
    }
}
