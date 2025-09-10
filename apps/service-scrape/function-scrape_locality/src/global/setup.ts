import { DB_SERVICE_SCRAPE, getKyselyPostgresDb } from '@service-scrape/lib-db_service_scrape'
import { BrowserService } from '../scrape/website/BrowserService'
import { ScrapeController } from '../scrape/ScrapeController'
import { OpenTelemetry, otelException } from '@observability/lib-opentelemetry'

export const SERVICE_NAME = 'function-scrape_locality'

const otel = new OpenTelemetry()
export const { LOGGER, TRACER } = otel.start({
    'service.name': SERVICE_NAME,
})

export const logLambdaException = (msg: string, args?: object) => {
    LOGGER.fatal(
        {
            'code.function.name': 'handler',
            'code.function.args': args ? JSON.stringify(args) : undefined,
            ...otelException(new Error(msg)),
        },
        msg,
    )
}

const DB = getKyselyPostgresDb(DB_SERVICE_SCRAPE)

// Application depends on database, hence it should crash
if (!DB) {
    throw logLambdaException(`FATAL ${SERVICE_NAME} database connection`)
}

const browserContext = await BrowserService.createBrowserContext()
const browserService = new BrowserService(LOGGER, browserContext)
export const scrapeController = new ScrapeController(LOGGER, DB, browserService)
