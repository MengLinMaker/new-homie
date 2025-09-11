import type { Schema } from '@service-scrape/lib-db_service_scrape'
import type { Kysely } from 'kysely'
import { ILoggable, type Logger } from '@observability/lib-opentelemetry'

export class IDatabased extends ILoggable {
    readonly DB: Kysely<Schema.DB>

    constructor(logger: Logger, db: Kysely<Schema.DB>) {
        super(logger)
        this.DB = db
    }
}
