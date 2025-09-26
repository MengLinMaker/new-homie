import type { Kysely } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .createIndex('home_table_home_feature_table_id_idx')
        .on('home_table')
        .column('home_feature_table_id')
        .execute()
    await db.schema
        .createIndex('home_table_locality_table_id_idx')
        .on('home_table')
        .column('locality_table_id')
        .execute()
    await db.schema
        .createIndex('sale_price_table_home_table_id_idx')
        .on('sale_price_table')
        .column('home_table_id')
        .execute()
    await db.schema
        .createIndex('rent_price_table_home_table_id_idx')
        .on('rent_price_table')
        .column('home_table_id')
        .execute()
    await db.schema
        .createIndex('school_table_locality_table_id_idx')
        .on('school_table')
        .column('locality_table_id')
        .execute()
    await db.schema
        .createIndex('school_table_school_feature_table_id_idx')
        .on('school_table')
        .column('school_feature_table_id')
        .execute()
}

export async function down(db: Kysely<DB>) {
    await db.schema.dropIndex('home_table_home_feature_table_id_idx').execute()
    await db.schema.dropIndex('home_table_locality_table_id_idx').execute()
    await db.schema.dropIndex('sale_price_table_home_table_id_idx').execute()
    await db.schema.dropIndex('rent_price_table_home_table_id_idx').execute()
    await db.schema.dropIndex('school_table_locality_table_id_idx').execute()
    await db.schema.dropIndex('school_table_school_feature_table_id_idx').execute()
}
