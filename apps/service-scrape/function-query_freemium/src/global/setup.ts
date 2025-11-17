import {
    DB_SERVICE_SCRAPE,
    getKyselyPostgresDb,
    type SchemaWrite,
} from '@service-scrape/lib-db_service_scrape'
import { OpenTelemetry, otelException } from '@observability/lib-opentelemetry'

const SERVICE_NAME = 'function-query_premium'

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

const DB = getKyselyPostgresDb<SchemaWrite.DB>(DB_SERVICE_SCRAPE)
if (!DB) throw logLambdaException(`FATAL ${SERVICE_NAME} database connection`)
