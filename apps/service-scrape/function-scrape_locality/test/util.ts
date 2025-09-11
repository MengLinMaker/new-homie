import { readFileSync } from 'node:fs'
import { BrowserService } from '../src/scrape/website/BrowserService'
import path from 'node:path'
import type { Kysely } from 'kysely'
import type { Schema } from '@service-scrape/lib-db_service_scrape'
import { OpenTelemetry } from '@observability/lib-opentelemetry'

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

export const dbCountRow = async (db: Kysely<Schema.DB>, tableName: keyof Schema.DB) =>
    (await db.selectFrom(tableName).select('id').execute()).length

const otel = new OpenTelemetry()
export const { LOGGER } = otel.start({
    'service.name': '@service-scrape/function-scrape_locality/test',
})
