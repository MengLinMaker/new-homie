import { describe, expect, it } from 'vitest'
import { createPostgisPointString, createPostgisPolygonString } from '../src/util'

describe('util functions', () => {
    describe('createPostgisPointString', () => {
        it('should return valid string', () => {
            const long = 144.9631
            const lat = -37.8136
            const result = createPostgisPointString(long, lat)
            expect(result).toBe('POINT(144.9631 -37.8136)')
        })
    })

    describe('createPostgisPolygonString', () => {
        it('should succeed for enclosed coordinates', () => {
            const coord = [
                [1, 2],
                [3, 4],
                [5, 6],
                [1, 2],
            ]
            const result = createPostgisPolygonString(coord)
            expect(result).toBe('POLYGON((1 2, 3 4, 5 6, 1 2))')
        })

        it('should fail with too little coordinates', () => {
            const coord = [
                [1, 2],
                [3, 4],
            ]
            const result = createPostgisPolygonString(coord)
            expect(result).toBe(null)
        })

        it('should fail with open coordinates', () => {
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
})
