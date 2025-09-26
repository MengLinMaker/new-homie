import type {
    Generated,
    HomeTypeEnum,
    StateAbbreviationEnum,
    Timestamp,
    DB as DB_Tables,
} from './schema'

interface LatestSaleView {
    // sale_price_table columns
    aud_per_bed: number
    aud_per_land_m2: number
    first_scrape_date: Generated<Timestamp>
    higher_price_aud: number
    home_table_id: number
    last_scrape_date: Generated<Timestamp>
    // home_table columns
    auction_time: Timestamp | null
    gps: string | null
    home_feature_table_id: number
    inspection_time: Timestamp | null
    land_m2: number
    locality_table_id: number
    street_address: string
    // home_feature_table columns
    bath_quantity: number
    bed_quantity: number
    car_quantity: number
    home_type: HomeTypeEnum
    is_retirement: boolean
    // locality_table columns
    boundary_coordinates: string
    postcode: string
    state_abbreviation: StateAbbreviationEnum
    suburb_name: string
}

interface LatestRentView {
    // sale_price_table columns
    aud_per_bed: number
    aud_per_land_m2: number
    first_scrape_date: Generated<Timestamp>
    weekly_rent_aud: number
    home_table_id: number
    last_scrape_date: Generated<Timestamp>
    // home_table columns
    auction_time: Timestamp | null
    gps: string | null
    home_feature_table_id: number
    inspection_time: Timestamp | null
    land_m2: number
    locality_table_id: number
    street_address: string
    // home_feature_table columns
    bath_quantity: number
    bed_quantity: number
    car_quantity: number
    home_type: HomeTypeEnum
    is_retirement: boolean
    // locality_table columns
    boundary_coordinates: string
    postcode: string
    state_abbreviation: StateAbbreviationEnum
    suburb_name: string
}

interface SchoolView {
    // school_table columns
    acara_id: number
    gps: string
    locality_table_id: number
    name: string
    school_feature_table_id: number
    url: string | null
    // school_feature_table columns
    government_sector: boolean
    independent: boolean
    primary: boolean
    secondary: boolean
    special_needs: boolean
    // locality_table columns
    boundary_coordinates: string
    postcode: string
    state_abbreviation: StateAbbreviationEnum
    suburb_name: string
}

export interface DB extends DB_Tables {
    latest_sale_view: LatestSaleView
    latest_rent_view: LatestRentView
    school_view: SchoolView
}
