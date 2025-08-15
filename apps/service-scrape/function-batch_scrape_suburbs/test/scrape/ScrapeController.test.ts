import { afterAll, describe, expect, it } from 'vitest'
import { LOGGER, parseTextFile, MockBrowserService, suiteNameFromFileName } from '../util'
import { ScrapeController } from '../../src/scrape/ScrapeController'
import { setupTestPostgisDb } from '@service-scrape/lib-db_service_scrape'

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
        state: 'vic',
        postcode: 3175,
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
    })
})
