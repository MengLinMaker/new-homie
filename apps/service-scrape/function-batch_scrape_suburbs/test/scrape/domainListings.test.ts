import { describe, expect, it } from 'vitest'
import { domainListings } from '../../src/scrape/domainListings'
import type { z } from 'zod'
import { parseJsonFile } from '../util'

const testSuiteName = 'domainListings'
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, () => {
  describe('tryExtractListing', () => {
    it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
      'should extract listings from %s',
      async (fileSuffix) => {
        const inputObject = parseJsonFile(`${resourcePath}/raw.${fileSuffix}.json`)
        const expectedObject = parseJsonFile(
          `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
        )

        const [value, success] = await domainListings.tryExtractListings(inputObject)
        if (!success) return expect(success).toBe(true)
        const [resultObject, _isLastpage] = value
        expect(resultObject).toStrictEqual(expectedObject)
      },
    )

    it('should not extract invalid input', async () => {
      const [resultObject, success] = await domainListings.tryExtractListings({})
      expect(success).toBe(false)
      expect(resultObject).toBeInstanceOf(Error)
    })
  })

  describe('tryTransformListing', () => {
    it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
      'should transform listings from %s',
      async (fileSuffix) => {
        const inputListings = parseJsonFile(
          `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
        ) as z.infer<typeof domainListings.listingsSchema>[]
        const expectedObject = parseJsonFile(
          `${resourcePath}/tryTransformListing.${fileSuffix}.json`,
        ) as any[]

        for (let i = 0; i < inputListings.length; i++) {
          const [databaseInserts, success] = await domainListings.tryTransformListing(
            inputListings[i]!,
          )
          if (!success) return expect(success).toBe(true)
          expect(databaseInserts).toStrictEqual(expectedObject[i])
        }
      },
    )

    it('should not transform invalid input', async () => {
      // @ts-expect-error
      const [resultObject, success] = await domainListings.tryTransformListing({})
      expect(success).toBe(false)
      expect(resultObject).toBeInstanceOf(Error)
    })
  })

  describe('tryTransformSalePrice', () => {
    it.for(['sale.dandenong-vic-3175'])('should transform listings from %s', async (fileSuffix) => {
      const inputListings = parseJsonFile(
        `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
      ) as z.infer<typeof domainListings.listingsSchema>[]
      const expectedObject = parseJsonFile(
        `${resourcePath}/tryTransformSalePrice.${fileSuffix}.json`,
      ) as any[]

      for (let i = 0; i < inputListings.length; i++) {
        const [databaseInserts, success] = await domainListings.tryTransformSalePrice(
          inputListings[i]!,
        )
        if (success) expect(databaseInserts).toStrictEqual(expectedObject[i])
      }
    })

    it('should not transform invalid input', async () => {
      // @ts-expect-error
      const [resultObject, success] = await domainListings.tryTransformListing({})
      expect(success).toBe(false)
      expect(resultObject).toBeInstanceOf(Error)
    })
  })

  describe('tryTransformRentPrice', () => {
    it.for(['rent.dandenong-vic-3175'])('should transform listings from %s', async (fileSuffix) => {
      const inputListings = parseJsonFile(
        `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
      ) as z.infer<typeof domainListings.listingsSchema>[]
      const expectedObject = parseJsonFile(
        `${resourcePath}/tryTransformRentPrice.${fileSuffix}.json`,
      ) as any[]

      for (let i = 0; i < inputListings.length; i++) {
        const [databaseInserts, success] = await domainListings.tryTransformRentPrice(
          inputListings[i]!,
        )
        if (success) expect(databaseInserts).toStrictEqual(expectedObject[i])
      }
    })

    it('should not transform invalid input', async () => {
      // @ts-expect-error
      const [resultObject, success] = await domainListings.tryTransformListing({})
      expect(success).toBe(false)
      expect(resultObject).toBeInstanceOf(Error)
    })
  })
})
