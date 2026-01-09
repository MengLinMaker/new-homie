import { IDatabased } from '../global/IDatabased'
import { sql } from 'kysely'

export class PostprocessController extends IDatabased {
    async refreshLatestSaleMV() {
        try {
            await sql`REFRESH MATERIALIZED VIEW latest_sale_mv`.execute(this.DB)
            return true
        } catch (e) {
            this.logExceptionArgs('error', this.refreshLatestSaleMV, null, e)
            return false
        }
    }

    async refreshLatestRentMV() {
        try {
            await sql`REFRESH MATERIALIZED VIEW latest_rent_mv`.execute(this.DB)
            return true
        } catch (e) {
            this.logExceptionArgs('error', this.refreshLatestRentMV, null, e)
            return false
        }
    }
}
