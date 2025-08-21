import _australiaLocalities from './australia-localities.json'
import type { Updateable } from 'kysely'
import type { Schema } from '@service-scrape/lib-db_service_scrape'

export const australiaLocalities = _australiaLocalities as Updateable<Schema.LocalityTable>[]
