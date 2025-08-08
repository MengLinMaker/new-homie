import z from 'zod'

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

/**
 * Helper to insert PostGIS polygon to database
 * @param polygonCoord Simple polygon coordinate
 * @returns PostGIS polygon string
 */
export const createPostgisPolygonString = (polygonCoord: number[][] | undefined | null) => {
    try {
        const validCoord = z.array(z.array(z.number()).length(2)).min(3).parse(polygonCoord)
        const joinedCoord = validCoord.map((e) => `${e[0]} ${e[1]}`).join(', ')
        return `POLYGON((${joinedCoord}))`
    } catch {
        return null
    }
}
