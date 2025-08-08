import { describe, expect, test } from 'vitest'
import { enumToArray, createPostgisPointString, createPostgisPolygonString } from '../src/util'

describe('util functions', () => {
    test('enumToArray', () => {
        const mockEnum = {
            FIRST: 'first',
            SECOND: 'second',
            THIRD: 'third',
        }
        const result = enumToArray(mockEnum)
        expect(result).toEqual(['first', 'second', 'third'])
    })

    test('createPostgisPointString', () => {
        const long = 144.9631
        const lat = -37.8136
        const result = createPostgisPointString(long, lat)
        expect(result).toBe('POINT(144.9631 -37.8136)')
    })

    test('createPostgisPolygonString valid', () => {
        const coord = [
            [1, 2],
            [3, 4],
            [5, 6],
            [1, 2],
        ]
        const result = createPostgisPolygonString(coord)
        expect(result).toBe('POLYGON((1 2, 3 4, 5 6, 1 2))')
    })

    test('createPostgisPolygonString too short', () => {
        const coord = [
            [1, 2],
            [3, 4],
        ]
        const result = createPostgisPolygonString(coord)
        expect(result).toBe(null)
    })

    test('createPostgisPolygonString invalid polygon not closed', () => {
        const coord = [
            [1, 2],
            [3, 4],
            [5, 6],
            [7, 8],
        ]
        const result = createPostgisPolygonString(coord)
        expect(result).toBe(null)
    })
})
