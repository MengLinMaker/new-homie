import type { SchemaWrite } from '@service-scrape/lib-db_service_scrape'
import type { Kysely } from 'kysely'
import { ILoggable, type Logger } from '@observability/lib-opentelemetry'

export class IDatabased extends ILoggable {
    readonly DB: Kysely<SchemaWrite.DB>

    constructor(logger: Logger, db: Kysely<SchemaWrite.DB>) {
        super(logger)
        this.DB = db
    }
}
