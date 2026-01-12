/** Types generated for queries found in "src/scrape/website/model/ScrapeModel.sql" */
import { PreparedQuery } from '@pgtyped/runtime'

export type home_type_enum =
    | 'Apartment'
    | 'ApartmentUnitFlat'
    | 'BlockOfUnits'
    | 'DevelopmentSite'
    | 'Duplex'
    | 'FreeStanding'
    | 'House'
    | 'Land'
    | 'NewApartments'
    | 'NewHomeDesigns'
    | 'NewHouseLand'
    | 'NewLand'
    | 'PentHouse'
    | 'Retirement'
    | 'SemiDetached'
    | 'Studio'
    | 'Terrace'
    | 'Townhouse'
    | 'VacantLand'
    | 'Villa'

export type state_abbreviation_enum = 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA'

export type DateOrString = Date | string

/** 'UpsertLocality' parameters type */
export interface IUpsertLocalityParams {
    boundary_coordinates?: string | null | void
    postcode?: string | null | void
    state_abbreviation?: state_abbreviation_enum | null | void
    suburb_name?: string | null | void
}

/** 'UpsertLocality' return type */
export interface IUpsertLocalityResult {
    id: number
}

/** 'UpsertLocality' query type */
export interface IUpsertLocalityQuery {
    params: IUpsertLocalityParams
    result: IUpsertLocalityResult
}

const upsertLocalityIR: any = {
    usedParamSet: {
        boundary_coordinates: true,
        postcode: true,
        state_abbreviation: true,
        suburb_name: true,
    },
    params: [
        {
            name: 'boundary_coordinates',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 124, b: 144 }],
        },
        {
            name: 'postcode',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 151, b: 159 }],
        },
        {
            name: 'state_abbreviation',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 166, b: 184 }],
        },
        {
            name: 'suburb_name',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 191, b: 202 }],
        },
    ],
    statement:
        'INSERT INTO locality_table (\n    boundary_coordinates,\n    postcode,\n    state_abbreviation,\n    suburb_name\n)\nVALUES (\n    :boundary_coordinates,\n    :postcode,\n    :state_abbreviation,\n    :suburb_name\n)\nON CONFLICT (\n    suburb_name,\n    state_abbreviation,\n    postcode\n)\nDO UPDATE SET\n    boundary_coordinates = EXCLUDED.boundary_coordinates,\n    postcode = EXCLUDED.postcode,\n    state_abbreviation = EXCLUDED.state_abbreviation,\n    suburb_name = EXCLUDED.suburb_name\nRETURNING id',
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO locality_table (
 *     boundary_coordinates,
 *     postcode,
 *     state_abbreviation,
 *     suburb_name
 * )
 * VALUES (
 *     :boundary_coordinates,
 *     :postcode,
 *     :state_abbreviation,
 *     :suburb_name
 * )
 * ON CONFLICT (
 *     suburb_name,
 *     state_abbreviation,
 *     postcode
 * )
 * DO UPDATE SET
 *     boundary_coordinates = EXCLUDED.boundary_coordinates,
 *     postcode = EXCLUDED.postcode,
 *     state_abbreviation = EXCLUDED.state_abbreviation,
 *     suburb_name = EXCLUDED.suburb_name
 * RETURNING id
 * ```
 */
export const upsertLocality = new PreparedQuery<IUpsertLocalityParams, IUpsertLocalityResult>(
    upsertLocalityIR,
)

/** 'UpsertSchoolFeature' parameters type */
export interface IUpsertSchoolFeatureParams {
    government_sector?: boolean | null | void
    independent?: boolean | null | void
    primary?: boolean | null | void
    secondary?: boolean | null | void
    special_needs?: boolean | null | void
}

/** 'UpsertSchoolFeature' return type */
export interface IUpsertSchoolFeatureResult {
    id: number
}

/** 'UpsertSchoolFeature' query type */
export interface IUpsertSchoolFeatureQuery {
    params: IUpsertSchoolFeatureParams
    result: IUpsertSchoolFeatureResult
}

const upsertSchoolFeatureIR: any = {
    usedParamSet: {
        primary: true,
        secondary: true,
        government_sector: true,
        independent: true,
        special_needs: true,
    },
    params: [
        {
            name: 'primary',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 138, b: 145 }],
        },
        {
            name: 'secondary',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 152, b: 161 }],
        },
        {
            name: 'government_sector',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 168, b: 185 }],
        },
        {
            name: 'independent',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 192, b: 203 }],
        },
        {
            name: 'special_needs',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 210, b: 223 }],
        },
    ],
    statement:
        'INSERT INTO school_feature_table (\n    "primary",\n    secondary,\n    government_sector,\n    independent,\n    special_needs\n)\nVALUES (\n    :primary,\n    :secondary,\n    :government_sector,\n    :independent,\n    :special_needs\n)\nON CONFLICT (\n    "primary",\n    secondary,\n    government_sector,\n    independent,\n    special_needs\n)\nDO UPDATE SET\n    "primary" = EXCLUDED.primary,\n    secondary = EXCLUDED.secondary,\n    government_sector = EXCLUDED.government_sector,\n    independent = EXCLUDED.independent,\n    special_needs = EXCLUDED.special_needs\nRETURNING id',
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO school_feature_table (
 *     "primary",
 *     secondary,
 *     government_sector,
 *     independent,
 *     special_needs
 * )
 * VALUES (
 *     :primary,
 *     :secondary,
 *     :government_sector,
 *     :independent,
 *     :special_needs
 * )
 * ON CONFLICT (
 *     "primary",
 *     secondary,
 *     government_sector,
 *     independent,
 *     special_needs
 * )
 * DO UPDATE SET
 *     "primary" = EXCLUDED.primary,
 *     secondary = EXCLUDED.secondary,
 *     government_sector = EXCLUDED.government_sector,
 *     independent = EXCLUDED.independent,
 *     special_needs = EXCLUDED.special_needs
 * RETURNING id
 * ```
 */
export const upsertSchoolFeature = new PreparedQuery<
    IUpsertSchoolFeatureParams,
    IUpsertSchoolFeatureResult
>(upsertSchoolFeatureIR)

/** 'UpsertSchool' parameters type */
export interface IUpsertSchoolParams {
    acara_id?: number | null | void
    gps?: string | null | void
    localityId?: number | null | void
    name?: string | null | void
    school_feature_table_id?: number | null | void
    url?: string | null | void
}

/** 'UpsertSchool' return type */
export interface IUpsertSchoolResult {
    id: number
}

/** 'UpsertSchool' query type */
export interface IUpsertSchoolQuery {
    params: IUpsertSchoolParams
    result: IUpsertSchoolResult
}

const upsertSchoolIR: any = {
    usedParamSet: {
        school_feature_table_id: true,
        localityId: true,
        name: true,
        url: true,
        acara_id: true,
        gps: true,
    },
    params: [
        {
            name: 'school_feature_table_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 135, b: 158 }],
        },
        {
            name: 'localityId',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 165, b: 175 }],
        },
        {
            name: 'name',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 182, b: 186 }],
        },
        { name: 'url', required: false, transform: { type: 'scalar' }, locs: [{ a: 193, b: 196 }] },
        {
            name: 'acara_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 203, b: 211 }],
        },
        { name: 'gps', required: false, transform: { type: 'scalar' }, locs: [{ a: 218, b: 221 }] },
    ],
    statement:
        'INSERT INTO school_table (\n    school_feature_table_id,\n    locality_table_id,\n    name,\n    url,\n    acara_id,\n    gps\n)\nVALUES (\n    :school_feature_table_id,\n    :localityId,\n    :name,\n    :url,\n    :acara_id,\n    :gps\n)\nON CONFLICT ( acara_id )\nDO UPDATE SET\n    school_feature_table_id = EXCLUDED.school_feature_table_id,\n    locality_table_id = EXCLUDED.locality_table_id,\n    name = EXCLUDED.name,\n    url = EXCLUDED.url,\n    acara_id = EXCLUDED.acara_id,\n    gps = EXCLUDED.gps\nRETURNING id',
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO school_table (
 *     school_feature_table_id,
 *     locality_table_id,
 *     name,
 *     url,
 *     acara_id,
 *     gps
 * )
 * VALUES (
 *     :school_feature_table_id,
 *     :localityId,
 *     :name,
 *     :url,
 *     :acara_id,
 *     :gps
 * )
 * ON CONFLICT ( acara_id )
 * DO UPDATE SET
 *     school_feature_table_id = EXCLUDED.school_feature_table_id,
 *     locality_table_id = EXCLUDED.locality_table_id,
 *     name = EXCLUDED.name,
 *     url = EXCLUDED.url,
 *     acara_id = EXCLUDED.acara_id,
 *     gps = EXCLUDED.gps
 * RETURNING id
 * ```
 */
export const upsertSchool = new PreparedQuery<IUpsertSchoolParams, IUpsertSchoolResult>(
    upsertSchoolIR,
)

/** 'UpsertHomeFeature' parameters type */
export interface IUpsertHomeFeatureParams {
    bath_quantity?: number | null | void
    bed_quantity?: number | null | void
    car_quantity?: number | null | void
    home_type?: home_type_enum | null | void
    is_retirement?: boolean | null | void
}

/** 'UpsertHomeFeature' return type */
export interface IUpsertHomeFeatureResult {
    id: number
}

/** 'UpsertHomeFeature' query type */
export interface IUpsertHomeFeatureQuery {
    params: IUpsertHomeFeatureParams
    result: IUpsertHomeFeatureResult
}

const upsertHomeFeatureIR: any = {
    usedParamSet: {
        bath_quantity: true,
        bed_quantity: true,
        car_quantity: true,
        home_type: true,
        is_retirement: true,
    },
    params: [
        {
            name: 'bath_quantity',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 136, b: 149 }],
        },
        {
            name: 'bed_quantity',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 156, b: 168 }],
        },
        {
            name: 'car_quantity',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 175, b: 187 }],
        },
        {
            name: 'home_type',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 194, b: 203 }],
        },
        {
            name: 'is_retirement',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 210, b: 223 }],
        },
    ],
    statement:
        'INSERT INTO home_feature_table (\n    bath_quantity,\n    bed_quantity,\n    car_quantity,\n    home_type,\n    is_retirement\n)\nVALUES (\n    :bath_quantity,\n    :bed_quantity,\n    :car_quantity,\n    :home_type,\n    :is_retirement\n)\nON CONFLICT (\n    bath_quantity,\n    bed_quantity,\n    car_quantity,\n    home_type,\n    is_retirement\n)\nDO UPDATE SET\n    bath_quantity = EXCLUDED.bath_quantity,\n    bed_quantity = EXCLUDED.bed_quantity,\n    car_quantity = EXCLUDED.car_quantity,\n    home_type = EXCLUDED.home_type,\n    is_retirement = EXCLUDED.is_retirement\nRETURNING id',
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO home_feature_table (
 *     bath_quantity,
 *     bed_quantity,
 *     car_quantity,
 *     home_type,
 *     is_retirement
 * )
 * VALUES (
 *     :bath_quantity,
 *     :bed_quantity,
 *     :car_quantity,
 *     :home_type,
 *     :is_retirement
 * )
 * ON CONFLICT (
 *     bath_quantity,
 *     bed_quantity,
 *     car_quantity,
 *     home_type,
 *     is_retirement
 * )
 * DO UPDATE SET
 *     bath_quantity = EXCLUDED.bath_quantity,
 *     bed_quantity = EXCLUDED.bed_quantity,
 *     car_quantity = EXCLUDED.car_quantity,
 *     home_type = EXCLUDED.home_type,
 *     is_retirement = EXCLUDED.is_retirement
 * RETURNING id
 * ```
 */
export const upsertHomeFeature = new PreparedQuery<
    IUpsertHomeFeatureParams,
    IUpsertHomeFeatureResult
>(upsertHomeFeatureIR)

/** 'UpsertHome' parameters type */
export interface IUpsertHomeParams {
    auction_time?: DateOrString | null | void
    gps?: string | null | void
    home_feature_table_id?: number | null | void
    inspection_time?: DateOrString | null | void
    land_m2?: number | null | void
    locality_table_id?: number | null | void
    street_address?: string | null | void
}

/** 'UpsertHome' return type */
export interface IUpsertHomeResult {
    id: number
}

/** 'UpsertHome' query type */
export interface IUpsertHomeQuery {
    params: IUpsertHomeParams
    result: IUpsertHomeResult
}

const upsertHomeIR: any = {
    usedParamSet: {
        locality_table_id: true,
        gps: true,
        auction_time: true,
        home_feature_table_id: true,
        inspection_time: true,
        land_m2: true,
        street_address: true,
    },
    params: [
        {
            name: 'locality_table_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 170, b: 187 }],
        },
        { name: 'gps', required: false, transform: { type: 'scalar' }, locs: [{ a: 194, b: 197 }] },
        {
            name: 'auction_time',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 204, b: 216 }],
        },
        {
            name: 'home_feature_table_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 223, b: 244 }],
        },
        {
            name: 'inspection_time',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 251, b: 266 }],
        },
        {
            name: 'land_m2',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 273, b: 280 }],
        },
        {
            name: 'street_address',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 287, b: 301 }],
        },
    ],
    statement:
        'INSERT INTO home_table (\n    locality_table_id,\n    gps,\n    auction_time,\n    home_feature_table_id,\n    inspection_time,\n    land_m2,\n    street_address\n)\nVALUES (\n    :locality_table_id,\n    :gps,\n    :auction_time,\n    :home_feature_table_id,\n    :inspection_time,\n    :land_m2,\n    :street_address\n)\nON CONFLICT (\n    street_address,\n    locality_table_id\n)\nDO UPDATE SET\n    locality_table_id = EXCLUDED.locality_table_id,\n    gps = COALESCE(EXCLUDED.gps, home_table.gps),\n    auction_time = EXCLUDED.auction_time,\n    home_feature_table_id = EXCLUDED.home_feature_table_id,\n    inspection_time = EXCLUDED.inspection_time,\n    land_m2 = GREATEST(EXCLUDED.land_m2, home_table.land_m2),\n    street_address = EXCLUDED.street_address\nRETURNING id',
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO home_table (
 *     locality_table_id,
 *     gps,
 *     auction_time,
 *     home_feature_table_id,
 *     inspection_time,
 *     land_m2,
 *     street_address
 * )
 * VALUES (
 *     :locality_table_id,
 *     :gps,
 *     :auction_time,
 *     :home_feature_table_id,
 *     :inspection_time,
 *     :land_m2,
 *     :street_address
 * )
 * ON CONFLICT (
 *     street_address,
 *     locality_table_id
 * )
 * DO UPDATE SET
 *     locality_table_id = EXCLUDED.locality_table_id,
 *     gps = COALESCE(EXCLUDED.gps, home_table.gps),
 *     auction_time = EXCLUDED.auction_time,
 *     home_feature_table_id = EXCLUDED.home_feature_table_id,
 *     inspection_time = EXCLUDED.inspection_time,
 *     land_m2 = GREATEST(EXCLUDED.land_m2, home_table.land_m2),
 *     street_address = EXCLUDED.street_address
 * RETURNING id
 * ```
 */
export const upsertHome = new PreparedQuery<IUpsertHomeParams, IUpsertHomeResult>(upsertHomeIR)

/** 'GetLastRentScrapeData' parameters type */
export interface IGetLastRentScrapeDataParams {
    home_table_id?: number | null | void
}

/** 'GetLastRentScrapeData' return type */
export interface IGetLastRentScrapeDataResult {
    id: number
    last_scrape_date: Date
    weekly_rent_aud: number
}

/** 'GetLastRentScrapeData' query type */
export interface IGetLastRentScrapeDataQuery {
    params: IGetLastRentScrapeDataParams
    result: IGetLastRentScrapeDataResult
}

const getLastRentScrapeDataIR: any = {
    usedParamSet: { home_table_id: true },
    params: [
        {
            name: 'home_table_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 89, b: 102 }],
        },
    ],
    statement:
        'SELECT id, last_scrape_date, weekly_rent_aud\nFROM rent_price_table\nWHERE home_table_id = :home_table_id\nORDER BY last_scrape_date DESC\nLIMIT 1',
}

/**
 * Query generated from SQL:
 * ```
 * SELECT id, last_scrape_date, weekly_rent_aud
 * FROM rent_price_table
 * WHERE home_table_id = :home_table_id
 * ORDER BY last_scrape_date DESC
 * LIMIT 1
 * ```
 */
export const getLastRentScrapeData = new PreparedQuery<
    IGetLastRentScrapeDataParams,
    IGetLastRentScrapeDataResult
>(getLastRentScrapeDataIR)

/** 'InsertRentPriceTable' parameters type */
export interface IInsertRentPriceTableParams {
    aud_per_bed?: number | null | void
    aud_per_land_m2?: number | null | void
    first_scrape_date?: DateOrString | null | void
    home_table_id?: number | null | void
    last_scrape_date?: DateOrString | null | void
    weekly_rent_aud?: number | null | void
}

/** 'InsertRentPriceTable' return type */
export type IInsertRentPriceTableResult = void

/** 'InsertRentPriceTable' query type */
export interface IInsertRentPriceTableQuery {
    params: IInsertRentPriceTableParams
    result: IInsertRentPriceTableResult
}

const insertRentPriceTableIR: any = {
    usedParamSet: {
        aud_per_bed: true,
        aud_per_land_m2: true,
        first_scrape_date: true,
        last_scrape_date: true,
        weekly_rent_aud: true,
        home_table_id: true,
    },
    params: [
        {
            name: 'aud_per_bed',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 168, b: 179 }],
        },
        {
            name: 'aud_per_land_m2',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 186, b: 201 }],
        },
        {
            name: 'first_scrape_date',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 208, b: 225 }],
        },
        {
            name: 'last_scrape_date',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 232, b: 248 }],
        },
        {
            name: 'weekly_rent_aud',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 255, b: 270 }],
        },
        {
            name: 'home_table_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 277, b: 290 }],
        },
    ],
    statement:
        'INSERT INTO rent_price_table (\n    aud_per_bed,\n    aud_per_land_m2,\n    first_scrape_date,\n    last_scrape_date,\n    weekly_rent_aud,\n    home_table_id\n)\nVALUES (\n    :aud_per_bed,\n    :aud_per_land_m2,\n    :first_scrape_date,\n    :last_scrape_date,\n    :weekly_rent_aud,\n    :home_table_id\n)',
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rent_price_table (
 *     aud_per_bed,
 *     aud_per_land_m2,
 *     first_scrape_date,
 *     last_scrape_date,
 *     weekly_rent_aud,
 *     home_table_id
 * )
 * VALUES (
 *     :aud_per_bed,
 *     :aud_per_land_m2,
 *     :first_scrape_date,
 *     :last_scrape_date,
 *     :weekly_rent_aud,
 *     :home_table_id
 * )
 * ```
 */
export const insertRentPriceTable = new PreparedQuery<
    IInsertRentPriceTableParams,
    IInsertRentPriceTableResult
>(insertRentPriceTableIR)

/** 'UpdateSameDayRentPriceTable' parameters type */
export interface IUpdateSameDayRentPriceTableParams {
    aud_per_bed?: number | null | void
    aud_per_land_m2?: number | null | void
    id?: number | null | void
    weekly_rent_aud?: number | null | void
}

/** 'UpdateSameDayRentPriceTable' return type */
export type IUpdateSameDayRentPriceTableResult = void

/** 'UpdateSameDayRentPriceTable' query type */
export interface IUpdateSameDayRentPriceTableQuery {
    params: IUpdateSameDayRentPriceTableParams
    result: IUpdateSameDayRentPriceTableResult
}

const updateSameDayRentPriceTableIR: any = {
    usedParamSet: { aud_per_bed: true, aud_per_land_m2: true, weekly_rent_aud: true, id: true },
    params: [
        {
            name: 'aud_per_bed',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 55, b: 66 }],
        },
        {
            name: 'aud_per_land_m2',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 114, b: 129 }],
        },
        {
            name: 'weekly_rent_aud',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 181, b: 196 }],
        },
        { name: 'id', required: false, transform: { type: 'scalar' }, locs: [{ a: 227, b: 229 }] },
    ],
    statement:
        'UPDATE rent_price_table\nSET\n    aud_per_bed = GREATEST(:aud_per_bed, aud_per_bed),\n    aud_per_land_m2 = GREATEST(:aud_per_land_m2, aud_per_land_m2),\n    weekly_rent_aud = GREATEST(:weekly_rent_aud, weekly_rent_aud)\nWHERE id = :id',
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE rent_price_table
 * SET
 *     aud_per_bed = GREATEST(:aud_per_bed, aud_per_bed),
 *     aud_per_land_m2 = GREATEST(:aud_per_land_m2, aud_per_land_m2),
 *     weekly_rent_aud = GREATEST(:weekly_rent_aud, weekly_rent_aud)
 * WHERE id = :id
 * ```
 */
export const updateSameDayRentPriceTable = new PreparedQuery<
    IUpdateSameDayRentPriceTableParams,
    IUpdateSameDayRentPriceTableResult
>(updateSameDayRentPriceTableIR)

/** 'UpdateSamePriceRentPriceTable' parameters type */
export interface IUpdateSamePriceRentPriceTableParams {
    id?: number | null | void
    last_scrape_date?: DateOrString | null | void
}

/** 'UpdateSamePriceRentPriceTable' return type */
export type IUpdateSamePriceRentPriceTableResult = void

/** 'UpdateSamePriceRentPriceTable' query type */
export interface IUpdateSamePriceRentPriceTableQuery {
    params: IUpdateSamePriceRentPriceTableParams
    result: IUpdateSamePriceRentPriceTableResult
}

const updateSamePriceRentPriceTableIR: any = {
    usedParamSet: { last_scrape_date: true, id: true },
    params: [
        {
            name: 'last_scrape_date',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 47, b: 63 }],
        },
        { name: 'id', required: false, transform: { type: 'scalar' }, locs: [{ a: 76, b: 78 }] },
    ],
    statement: 'UPDATE rent_price_table\nSET last_scrape_date = :last_scrape_date\nWHERE id = :id',
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE rent_price_table
 * SET last_scrape_date = :last_scrape_date
 * WHERE id = :id
 * ```
 */
export const updateSamePriceRentPriceTable = new PreparedQuery<
    IUpdateSamePriceRentPriceTableParams,
    IUpdateSamePriceRentPriceTableResult
>(updateSamePriceRentPriceTableIR)

/** 'GetLastSaleScrapeData' parameters type */
export interface IGetLastSaleScrapeDataParams {
    home_table_id?: number | null | void
}

/** 'GetLastSaleScrapeData' return type */
export interface IGetLastSaleScrapeDataResult {
    higher_price_aud: number
    id: number
    last_scrape_date: Date
}

/** 'GetLastSaleScrapeData' query type */
export interface IGetLastSaleScrapeDataQuery {
    params: IGetLastSaleScrapeDataParams
    result: IGetLastSaleScrapeDataResult
}

const getLastSaleScrapeDataIR: any = {
    usedParamSet: { home_table_id: true },
    params: [
        {
            name: 'home_table_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 90, b: 103 }],
        },
    ],
    statement:
        'SELECT id, last_scrape_date, higher_price_aud\nFROM sale_price_table\nWHERE home_table_id = :home_table_id\nORDER BY last_scrape_date DESC\nLIMIT 1',
}

/**
 * Query generated from SQL:
 * ```
 * SELECT id, last_scrape_date, higher_price_aud
 * FROM sale_price_table
 * WHERE home_table_id = :home_table_id
 * ORDER BY last_scrape_date DESC
 * LIMIT 1
 * ```
 */
export const getLastSaleScrapeData = new PreparedQuery<
    IGetLastSaleScrapeDataParams,
    IGetLastSaleScrapeDataResult
>(getLastSaleScrapeDataIR)

/** 'InsertSalePriceTable' parameters type */
export interface IInsertSalePriceTableParams {
    aud_per_bed?: number | null | void
    aud_per_land_m2?: number | null | void
    first_scrape_date?: DateOrString | null | void
    higher_price_aud?: number | null | void
    home_table_id?: number | null | void
    last_scrape_date?: DateOrString | null | void
}

/** 'InsertSalePriceTable' return type */
export type IInsertSalePriceTableResult = void

/** 'InsertSalePriceTable' query type */
export interface IInsertSalePriceTableQuery {
    params: IInsertSalePriceTableParams
    result: IInsertSalePriceTableResult
}

const insertSalePriceTableIR: any = {
    usedParamSet: {
        aud_per_bed: true,
        aud_per_land_m2: true,
        first_scrape_date: true,
        last_scrape_date: true,
        higher_price_aud: true,
        home_table_id: true,
    },
    params: [
        {
            name: 'aud_per_bed',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 169, b: 180 }],
        },
        {
            name: 'aud_per_land_m2',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 187, b: 202 }],
        },
        {
            name: 'first_scrape_date',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 209, b: 226 }],
        },
        {
            name: 'last_scrape_date',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 233, b: 249 }],
        },
        {
            name: 'higher_price_aud',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 256, b: 272 }],
        },
        {
            name: 'home_table_id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 279, b: 292 }],
        },
    ],
    statement:
        'INSERT INTO sale_price_table (\n    aud_per_bed,\n    aud_per_land_m2,\n    first_scrape_date,\n    last_scrape_date,\n    higher_price_aud,\n    home_table_id\n)\nVALUES (\n    :aud_per_bed,\n    :aud_per_land_m2,\n    :first_scrape_date,\n    :last_scrape_date,\n    :higher_price_aud,\n    :home_table_id\n)',
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sale_price_table (
 *     aud_per_bed,
 *     aud_per_land_m2,
 *     first_scrape_date,
 *     last_scrape_date,
 *     higher_price_aud,
 *     home_table_id
 * )
 * VALUES (
 *     :aud_per_bed,
 *     :aud_per_land_m2,
 *     :first_scrape_date,
 *     :last_scrape_date,
 *     :higher_price_aud,
 *     :home_table_id
 * )
 * ```
 */
export const insertSalePriceTable = new PreparedQuery<
    IInsertSalePriceTableParams,
    IInsertSalePriceTableResult
>(insertSalePriceTableIR)

/** 'UpdateSameDaySalePriceTable' parameters type */
export interface IUpdateSameDaySalePriceTableParams {
    aud_per_bed?: number | null | void
    aud_per_land_m2?: number | null | void
    higher_price_aud?: number | null | void
    id?: number | null | void
}

/** 'UpdateSameDaySalePriceTable' return type */
export type IUpdateSameDaySalePriceTableResult = void

/** 'UpdateSameDaySalePriceTable' query type */
export interface IUpdateSameDaySalePriceTableQuery {
    params: IUpdateSameDaySalePriceTableParams
    result: IUpdateSameDaySalePriceTableResult
}

const updateSameDaySalePriceTableIR: any = {
    usedParamSet: { aud_per_bed: true, aud_per_land_m2: true, higher_price_aud: true, id: true },
    params: [
        {
            name: 'aud_per_bed',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 55, b: 66 }],
        },
        {
            name: 'aud_per_land_m2',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 114, b: 129 }],
        },
        {
            name: 'higher_price_aud',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 182, b: 198 }],
        },
        { name: 'id', required: false, transform: { type: 'scalar' }, locs: [{ a: 230, b: 232 }] },
    ],
    statement:
        'UPDATE sale_price_table\nSET\n    aud_per_bed = GREATEST(:aud_per_bed, aud_per_bed),\n    aud_per_land_m2 = GREATEST(:aud_per_land_m2, aud_per_land_m2),\n    higher_price_aud = GREATEST(:higher_price_aud, higher_price_aud)\nWHERE id = :id',
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE sale_price_table
 * SET
 *     aud_per_bed = GREATEST(:aud_per_bed, aud_per_bed),
 *     aud_per_land_m2 = GREATEST(:aud_per_land_m2, aud_per_land_m2),
 *     higher_price_aud = GREATEST(:higher_price_aud, higher_price_aud)
 * WHERE id = :id
 * ```
 */
export const updateSameDaySalePriceTable = new PreparedQuery<
    IUpdateSameDaySalePriceTableParams,
    IUpdateSameDaySalePriceTableResult
>(updateSameDaySalePriceTableIR)

/** 'UpdateSamePriceSalePriceTable' parameters type */
export interface IUpdateSamePriceSalePriceTableParams {
    id?: number | null | void
    last_scrape_date?: DateOrString | null | void
}

/** 'UpdateSamePriceSalePriceTable' return type */
export type IUpdateSamePriceSalePriceTableResult = void

/** 'UpdateSamePriceSalePriceTable' query type */
export interface IUpdateSamePriceSalePriceTableQuery {
    params: IUpdateSamePriceSalePriceTableParams
    result: IUpdateSamePriceSalePriceTableResult
}

const updateSamePriceSalePriceTableIR: any = {
    usedParamSet: { last_scrape_date: true, id: true },
    params: [
        {
            name: 'last_scrape_date',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 47, b: 63 }],
        },
        { name: 'id', required: false, transform: { type: 'scalar' }, locs: [{ a: 76, b: 78 }] },
    ],
    statement: 'UPDATE sale_price_table\nSET last_scrape_date = :last_scrape_date\nWHERE id = :id',
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE sale_price_table
 * SET last_scrape_date = :last_scrape_date
 * WHERE id = :id
 * ```
 */
export const updateSamePriceSalePriceTable = new PreparedQuery<
    IUpdateSamePriceSalePriceTableParams,
    IUpdateSamePriceSalePriceTableResult
>(updateSamePriceSalePriceTableIR)
