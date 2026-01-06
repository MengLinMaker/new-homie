import { OpenTelemetry, otelException } from '@observability/lib-opentelemetry'
import type { SchemaRead } from '@service-scrape/lib-db_service_scrape'
import { DB_SERVICE_SCRAPE } from '@service-scrape/lib-db_service_scrape'
import { getKyselyPostgresDb } from '@service-scrape/lib-db_service_scrape'
import { PostprocessController } from '../postprocess/PostprocessController'

export const SERVICE_NAME = 'function-scrape_postprocess'

const otel = new OpenTelemetry()
export const { LOGGER } = otel.start({
    'service.name': SERVICE_NAME,
})

const logLambdaException = (msg: string, args?: object) => {
    LOGGER(
        'fatal',
        {
            'code.function.name': 'handler',
            'code.function.args': args ? JSON.stringify(args) : undefined,
            ...otelException(new Error(msg)),
        },
        msg,
    )
}

const DB = getKyselyPostgresDb<SchemaRead.DB>(DB_SERVICE_SCRAPE)
if (!DB) throw logLambdaException(`FATAL ${SERVICE_NAME} database connection`)

export const postprocessController = new PostprocessController(LOGGER, DB)
