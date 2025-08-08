/**
 * Conversion for zod
 * @param enumType - Kysely enum
 * @returns Array of string
 */
export const enumToArray = <T extends { [key: string]: string }>(enumType: T) => {
    type Value = T[keyof T]
    return Object.values(enumType) as [Value, ...Value[]]
}

/**
 * Helper to insert PostGIS point to database
 * @param long - Longitude
 * @param lat - Latitude
 * @returns PostGIS point string
 */
export const createPostgisPointString = (long: number, lat: number) => `POINT(${long} ${lat})`
