import { afterAll, describe, expect, it } from 'vitest'
import { LOGGER, parseTextFile, MockBrowserService, suiteNameFromFileName } from '../util'
import { ScrapeController } from '../../src/scrape/ScrapeController'
import { setupTestPostgisDb } from '@service-scrape/lib-db_service_scrape/dev'

const testSuiteName = suiteNameFromFileName(import.meta.filename)
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, async () => {
    const { container, db } = await setupTestPostgisDb()
    afterAll(async () => {
        await db.destroy()
        await container.stop()
    })

    const locality = {
        suburb: 'dandenong',
        state: 'VIC',
        postcode: '3175',
        localityId: 1,
    }
    const localityPage = { ...locality, page: 1 }

    describe.sequential('tryExtractSuburbPage', async () => {
        // Mock individually to prevent data race
        const mockBrowserService = new MockBrowserService(LOGGER, null as never)
        const scrapeController = new ScrapeController(LOGGER, db, mockBrowserService)
        mockBrowserService.mockHTML(parseTextFile(`${resourcePath}/domain.suburb.html`))

        it.sequential('should parse successfully', async () => {
            const output = await scrapeController.tryExtractSuburbPage(locality)
            expect(output).not.toBeNull()
        })

        it.sequential('should merge duplicate data', async () => {
            const output = await scrapeController.tryExtractSuburbPage(locality)
            expect(output).not.toBeNull()
            const ids = await db.selectFrom('localities_table').select('id').execute()
            expect(ids.length).toBe(1)
        })
    })

    describe.sequential('tryExtractRentsPage', async () => {
        // Mock individually to prevent data race
        const mockBrowserService = new MockBrowserService(LOGGER, null as never)
        const scrapeController = new ScrapeController(LOGGER, db, mockBrowserService)
        mockBrowserService.mockHTML(parseTextFile(`${resourcePath}/domain.rent.html`))

        it.sequential('should parse successfully', async () => {
            const output = await scrapeController.tryExtractRentsPage(localityPage)
            expect(output).not.toBeNull()
        })

        it.sequential('should merge duplicate data', async () => {
            const common_features_tableOld = await db
                .selectFrom('common_features_table')
                .select('id')
                .execute()
            const home_tableOld = await db.selectFrom('home_table').select('id').execute()
            const rent_price_tableOld = await db
                .selectFrom('rent_price_table')
                .select('id')
                .execute()

            const output = await scrapeController.tryExtractRentsPage(localityPage)
            if (!output) return expect(output).not.toBeNull()

            const common_features_table = await db
                .selectFrom('common_features_table')
                .select('id')
                .execute()
            const home_table = await db.selectFrom('home_table').select('id').execute()
            const rent_price_table = await db.selectFrom('rent_price_table').select('id').execute()

            expect(common_features_table.length).toBe(common_features_tableOld.length)
            expect(home_table.length).toBe(home_tableOld.length)
            expect(rent_price_table.length).toBe(rent_price_tableOld.length)
        })
    })

    describe.sequential('tryExtractSalesPage', async () => {
        // Mock individually to prevent data race
        const mockBrowserService = new MockBrowserService(LOGGER, null as never)
        const scrapeController = new ScrapeController(LOGGER, db, mockBrowserService)
        mockBrowserService.mockHTML(parseTextFile(`${resourcePath}/domain.sale.html`))

        it.sequential('should parse successfully', async () => {
            const output = await scrapeController.tryExtractSalesPage(localityPage)
            expect(output).not.toBeNull()
        })

        it.sequential('should merge duplicate data', async () => {
            const common_features_tableOld = await db
                .selectFrom('common_features_table')
                .select('id')
                .execute()
            const home_tableOld = await db.selectFrom('home_table').select('id').execute()
            const sale_price_tableOld = await db
                .selectFrom('sale_price_table')
                .select('id')
                .execute()

            const output = await scrapeController.tryExtractSalesPage(localityPage)
            if (!output) return expect(output).not.toBeNull()

            const common_features_table = await db
                .selectFrom('common_features_table')
                .select('id')
                .execute()
            const home_table = await db.selectFrom('home_table').select('id').execute()
            const sale_price_table = await db.selectFrom('sale_price_table').select('id').execute()

            expect(common_features_table.length).toBe(common_features_tableOld.length)
            expect(home_table.length).toBe(home_tableOld.length)
            expect(sale_price_table.length).toBe(sale_price_tableOld.length)
        })
    })
})
