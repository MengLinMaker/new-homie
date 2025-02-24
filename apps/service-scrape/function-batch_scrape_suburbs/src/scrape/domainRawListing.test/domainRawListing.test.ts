import { describe, expect, it } from 'vitest'
import { domainRawListing } from '../domainRawListing'
import { readFileSync } from 'node:fs'

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
        if (!success) {
          expect(success).toBe(true)
          return
        }
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

  describe.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
    'tryTransformListing',
    () => {
      it('should transform listings successfully', async () => { })

      it('should not extract invalid input', async () => {
        // @ts-ignore
        const [resultObject, success] = await domainRawListing.tryTransformListing({})
        expect(success).toBe(false)
        expect(resultObject).toBeInstanceOf(Error)
      })
    },
  )
})
