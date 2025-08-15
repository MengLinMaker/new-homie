import { readFileSync } from 'node:fs'
import pino from 'pino'
import { BrowserService } from '../src/scrape/website/BrowserService'
import path from 'node:path'

export const suiteNameFromFileName = (filePath: string) =>
    // biome-ignore lint/style/noNonNullAssertion: <will exist>
    path.basename(filePath).split('.').shift()!

export const parseJsonFile = (filePath: string) => JSON.parse(readFileSync(filePath).toString())

export const parseTextFile = (filePath: string) => readFileSync(filePath).toString()
export class MockBrowserService extends BrowserService {
    html = ''

    mockHTML(html: string) {
        this.html = html
    }

    override async getHTML(_url: string) {
        return this.html
    }
}

export const LOGGER = pino({
    level: 'fatal',
    transport: {
        target: 'pino-pretty',
    },
})
