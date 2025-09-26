import type { Kysely } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .createTable('school_feature_table')
        .addColumn('id', 'integer', (col) => col.notNull().primaryKey().generatedAlwaysAsIdentity())
        .addColumn('primary', 'boolean', (col) => col.notNull())
        .addColumn('secondary', 'boolean', (col) => col.notNull())
        .addColumn('government_sector', 'boolean', (col) => col.notNull())
        .addColumn('independent', 'boolean', (col) => col.notNull())
        .addColumn('special_needs', 'boolean', (col) => col.notNull())
        .addUniqueConstraint('school_feature_table_unique', [
            'primary',
            'secondary',
            'government_sector',
            'independent',
            'special_needs',
        ])
        .execute()
}

export async function down(db: Kysely<DB>) {
    await db.schema.dropTable('school_feature_table').execute()
}
