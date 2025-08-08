import { describe, expect, test } from 'vitest'
import { enumToArray, createPostgisPointString } from '../src/util'

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
})
