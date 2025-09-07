import { DB_SERVICE_SCRAPE, getKyselyPostgresDb } from '@service-scrape/lib-db_service_scrape'
import { ConnectionError } from 'common-errors'
import { BrowserService } from '../scrape/website/BrowserService'
import { ScrapeController } from '../scrape/ScrapeController'
import { OpenTelemetry, otelException } from '@observability/lib-opentelemetry'

export const SERVICE_NAME = 'function-scrape_locality'

const otel = new OpenTelemetry()
export const { LOGGER, TRACER } = otel.start({
    'service.name': SERVICE_NAME
})

const DB = await getKyselyPostgresDb(DB_SERVICE_SCRAPE)

// Application depends on database, hence it should crash
if (!DB) {
    const e = new ConnectionError(`Failed to connect to postgis database`)
    LOGGER.fatal(otelException(e))
    throw e
}

const browserContext = await BrowserService.createBrowserContext()
const browserService = new BrowserService(LOGGER, browserContext)
export const scrapeController = new ScrapeController(LOGGER, DB, browserService)
