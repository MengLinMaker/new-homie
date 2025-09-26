import type { HomeTypeEnum, StateAbbreviationEnum, Timestamp } from './schema'

export interface LatestSaleView {
    auction_time: Timestamp | null
    aud_per_bed: number
    aud_per_land_m2: number
    bath_quantity: number
    bed_quantity: number
    boundary_coordinates: string
    car_quantity: number
    first_scrape_date: Timestamp
    gps: string | null
    higher_price_aud: number
    home_feature_table_id: number
    home_table_id: number
    home_type: HomeTypeEnum
    inspection_time: Timestamp | null
    is_retirement: boolean
    land_m2: number
    last_scrape_date: Timestamp
    locality_table_id: number
    postcode: string
    state_abbreviation: StateAbbreviationEnum
    street_address: string
    suburb_name: string
}

export interface DB {
    latest_sale_view: LatestSaleView
}
