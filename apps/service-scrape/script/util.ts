import consola from 'consola'
import { readFileSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'

/**
 * Extracts json from brotli file
 * @param brotliFilePath
 */
export const readBrotliJson = (brotliFilePath: string) => {
    const brotliBuffer = readFileSync(brotliFilePath)
    const rawBuffer = brotliDecompressSync(brotliBuffer, undefined)
    return JSON.parse(rawBuffer.toString())
}

/**
 * @param coordinate
 */
export const notInAustralia = ([longitude, latitude]: [number, number]) =>
    longitude < 113.338953 ||
    longitude > 153.569469 ||
    latitude < -43.634597 ||
    latitude > -10.668185

/**
 * Round up to decimal place in performant way
 * @param {number} input
 * @param {number} decimal
 */
export const roundPlaces = (input: number, decimal: number) =>
    Math.round(input * 10 ** decimal) / 10 ** decimal

/**
 * Logs error if function throws
 * @param {() => void} fn - Function to execute
 */
export const tryCatchError = (fn: () => void) => {
    try {
        return fn()
    } catch (err) {
        consola.error('Error occurred:', err)
    }
}
