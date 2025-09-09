import z from 'zod'

/**
 * Helper to insert PostGIS point to database
 * @param long - Longitude
 * @param lat - Latitude
 * @returns PostGIS point string
 */
export const createPostgisPointString = (long: number, lat: number) => `POINT(${long} ${lat})`

/**
 * Helper to insert PostGIS point to database
 * @param long - Longitude
 * @param lat - Latitude
 * @returns PostGIS point string
 */
export const tryCreatePostgisPointString = (long: number | null, lat: number | null) => {
    if (typeof long !== 'number') return null
    if (typeof lat !== 'number') return null
    return createPostgisPointString(long, lat)
}

/**
 * Helper to insert PostGIS polygon to database
 * @param polygonCoord Simple polygon coordinate
 * @returns PostGIS polygon string
 */
export const createPostgisPolygonString = (polygonCoord: number[][] | undefined | null) => {
    try {
        const validCoord = z.array(z.array(z.number()).length(2)).min(4).parse(polygonCoord)

        const len = validCoord.length
        if (
            // biome-ignore lint/style/noNonNullAssertion: <already validated>
            validCoord[0]![0] !== validCoord[len - 1]![0] &&
            // biome-ignore lint/style/noNonNullAssertion: <already validated>
            validCoord[0]![1] !== validCoord[len - 1]![1]
        )
            return null

        const joinedCoord = validCoord.map((e) => `${e[0]} ${e[1]}`).join(', ')
        return `POLYGON((${joinedCoord}))`
    } catch {
        return null
    }
}
