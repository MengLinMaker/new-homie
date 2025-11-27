import {
    DB_SERVICE_SCRAPE,
    getKyselyPostgresDb,
    type SchemaRead,
} from '@service-scrape/lib-db_service_scrape'
import { OpenTelemetry, otelException } from '@observability/lib-opentelemetry'
import type { Kysely } from 'kysely'

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
export const DB = getKyselyPostgresDb<SchemaRead.DB>(DB_SERVICE_SCRAPE) as Pick<
    Kysely<SchemaRead.DB>,
    'selectFrom'
>
if (!DB) throw logLambdaException(`FATAL ${SERVICE_NAME} database connection`)
