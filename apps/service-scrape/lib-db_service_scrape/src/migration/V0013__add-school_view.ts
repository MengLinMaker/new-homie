import type { Kysely } from 'kysely'
import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>) {
    const school_view = db
        .selectFrom('school_table')
        .leftJoin(
            'school_feature_table',
            'school_table.school_feature_table_id',
            'school_feature_table.id',
        )
        .leftJoin('locality_table', 'school_table.locality_table_id', 'locality_table.id')
        .select([
            // school_table columns
            'acara_id',
            'name',
            'url',
            'gps',
            // school_feature_table columns
            'school_feature_table_id',
            'primary',
            'secondary',
            'government_sector',
            'independent',
            'special_needs',
            // locality_table columns
            'locality_table_id',
            'suburb_name',
            'state_abbreviation',
            'postcode',
            'boundary_coordinates',
        ])
    await db.schema.createView('school_view').as(school_view).execute()
}

export async function down(db: Kysely<DB>) {
    db.schema.dropView('school_view').execute()
}
