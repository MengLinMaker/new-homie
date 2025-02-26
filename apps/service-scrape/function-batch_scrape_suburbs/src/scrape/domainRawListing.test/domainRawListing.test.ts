import { describe, expect, it } from 'vitest'
import { domainRawListing } from '../domainRawListing'
import { readFileSync } from 'node:fs'
import { z } from 'zod'

describe('domainRawListing', () => {
  describe('tryExtractListing', () => {
    it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
      'should extract listings from %s',
      async (fileSuffix) => {
        const inputFile = `raw.${fileSuffix}.json`
        const expectedFile = `tryExtractListings.${fileSuffix}.json`
        const inputObject = JSON.parse(
          readFileSync(`${import.meta.dirname}/${inputFile}`).toString(),
        )
        const expectedObject = JSON.parse(
          readFileSync(`${import.meta.dirname}/${expectedFile}`).toString(),
        )

        const [value, success] = await domainRawListing.tryExtractListings(inputObject)
        if (!success) return expect(success).toBe(true)
        const [resultObject, _isLastpage] = value
        expect(resultObject).toStrictEqual(expectedObject)
      },
    )

    it('should not extract invalid input', async () => {
      const [resultObject, success] = await domainRawListing.tryExtractListings({})
      expect(success).toBe(false)
      expect(resultObject).toBeInstanceOf(Error)
    })
  })

  describe('tryTransformListing', () => {
    it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
      'should transform listings from %s',
      async (fileSuffix) => {
        const inputFile = `tryExtractListings.${fileSuffix}.json`
        const expectedFile = `tryTransformListing.${fileSuffix}.json`
        const inputListings = z
          .array(domainRawListing.listingSchema)
          .parse(JSON.parse(readFileSync(`${import.meta.dirname}/${inputFile}`).toString()))
        const expectedObject: any[] = JSON.parse(
          readFileSync(`${import.meta.dirname}/${expectedFile}`).toString(),
        )

        for (let i = 0; i < inputListings.length; i++) {
          const [databaseInserts, success] = await domainRawListing.tryTransformListing(
            inputListings[i]!,
          )
          if (!success) return expect(success).toBe(true)
          expect(databaseInserts).toStrictEqual(expectedObject[i])
        }
      },
    )

    it('should not transform invalid input', async () => {
      // @ts-expect-error
      const [resultObject, success] = await domainRawListing.tryTransformListing({})
      expect(success).toBe(false)
      expect(resultObject).toBeInstanceOf(Error)
    })
  })
})
