import { DB_SERVICE_SCRAPE, getKyselyPostgresDb } from '@service-scrape/lib-db_service_scrape'
import { ConnectionError } from 'common-errors'
import { LOGGER, otelException, SERVICE_NAME } from './otel'
import { BrowserService } from '../scrape/website/BrowserService'
import { ScrapeController } from '../scrape/ScrapeController'

const DB = await getKyselyPostgresDb(DB_SERVICE_SCRAPE ?? '')

// Application depends on database, hence it should crash
if (!DB) {
    const e = new ConnectionError(`${SERVICE_NAME} failed to connect to postgis database`)
    LOGGER.fatal(otelException(e))
    throw e
}

const browserContext = await BrowserService.createBrowserContext()
export const browserService = new BrowserService(LOGGER, browserContext)
export const scrapeController = new ScrapeController(LOGGER, DB, browserService)
