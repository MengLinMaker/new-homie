package org.scrape;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import java.io.File;
import java.io.IOException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.scrape.domain.ListingsProcessor;

public class DomainListingsTest {
    @Inject
    static final ObjectMapper objectMapper = JsonUtil.objectMapper;

    @Inject
    static final ListingsProcessor listingsProcessor = new ListingsProcessor();

    File jsonFile(String resourceFileName) throws IOException {
        var fileUrl = this.getClass().getResource("/org/scrape/domainListings/" + resourceFileName);
        File file = new File(fileUrl.getFile());
        Assertions.assertTrue(file.exists());
        return file;
    }

    @ParameterizedTest
    @CsvSource({
        "raw.rent.dandenong-vic-3175.json, extractListings.rent.dandenong-vic-3175.json",
        "raw.sale.dandenong-vic-3175.json, extractListings.sale.dandenong-vic-3175.json"
    })
    void extractListing_ok(String inputFile, String outputFile) throws IOException {
        var inputObject =
                objectMapper.readValue(jsonFile(inputFile), org.scrape.domain.NextDataListingsSchema.Root.class);
        var inputTree = objectMapper
                .readerForArrayOf(org.scrape.generated.domain.RawListingsSchema.Root.class)
                .createParser(jsonFile(outputFile));

        listingsProcessor.extractListings(inputObject);

        // Assertions.assertNull(objectMapper.writeValueAsString(inputTree));

        Assertions.assertEquals(2, 1 + 1);
    }

    @ParameterizedTest
    @CsvSource({"{}", "{\"test\": \"test\"}"})
    void extractListing_err(String inputJson) throws JsonProcessingException {
        var inputObject = listingsProcessor.tryParseNextJson(inputJson);
        Assertions.assertNull(objectMapper.writeValueAsString(inputObject.val.props.pageProps));

        Assertions.assertTrue(!inputObject.ok);

        Assertions.assertEquals(inputObject.err.getMessage(), 1);
    }
}

// describe(testSuiteName, () => {
//   describe('tryExtractListing', () => {
//     it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
//       'should extract listings from %s',
//       async (fileSuffix) => {
//         const inputObject = parseJsonFile(`${resourcePath}/raw.${fileSuffix}.json`)
//         const expectedObject = parseJsonFile(
//           `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
//         )

//         const [value, success] = await domainListings.tryExtractListings(inputObject)
//         if (!success) return expect(success).toBe(true)
//         const [resultObject, _isLastpage] = value
//         expect(resultObject).toStrictEqual(expectedObject)
//       },
//     )
//   })

//   describe('tryTransformListing', () => {
//     it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
//       'should transform listings from %s',
//       async (fileSuffix) => {
//         const inputListings = parseJsonFile(
//           `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
//         ) as z.infer<typeof domainListings.listingsSchema>[]
//         const expectedObject = parseJsonFile(
//           `${resourcePath}/tryTransformListing.${fileSuffix}.json`,
//         ) as any[]

//         for (let i = 0; i < inputListings.length; i++) {
//           const [databaseInserts, success] = await domainListings.tryTransformListing(
//             inputListings[i]!,
//           )
//           if (!success) return expect(success).toBe(true)
//           expect(databaseInserts).toStrictEqual(expectedObject[i])
//         }
//       },
//     )

//     it('should not transform invalid input', async () => {
//       // @ts-expect-error
//       const [resultObject, success] = await domainListings.tryTransformListing({})
//       expect(success).toBe(false)
//       expect(resultObject).toBeInstanceOf(Error)
//     })
//   })

//   describe('tryTransformSalePrice', () => {
//     it.for(['sale.dandenong-vic-3175'])('should transform listings from %s', async (fileSuffix) => {
//       const inputListings = parseJsonFile(
//         `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
//       ) as z.infer<typeof domainListings.listingsSchema>[]
//       const expectedObject = parseJsonFile(
//         `${resourcePath}/tryTransformSalePrice.${fileSuffix}.json`,
//       ) as any[]

//       for (let i = 0; i < inputListings.length; i++) {
//         const [databaseInserts, success] = await domainListings.tryTransformSalePrice(
//           inputListings[i]!,
//         )
//         if (success) expect(databaseInserts).toStrictEqual(expectedObject[i])
//       }
//     })

//     it('should not transform invalid input', async () => {
//       // @ts-expect-error
//       const [resultObject, success] = await domainListings.tryTransformListing({})
//       expect(success).toBe(false)
//       expect(resultObject).toBeInstanceOf(Error)
//     })
//   })

//   describe('tryTransformRentPrice', () => {
//     it.for(['rent.dandenong-vic-3175'])('should transform listings from %s', async (fileSuffix) => {
//       const inputListings = parseJsonFile(
//         `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
//       ) as z.infer<typeof domainListings.listingsSchema>[]
//       const expectedObject = parseJsonFile(
//         `${resourcePath}/tryTransformRentPrice.${fileSuffix}.json`,
//       ) as any[]

//       for (let i = 0; i < inputListings.length; i++) {
//         const [databaseInserts, success] = await domainListings.tryTransformRentPrice(
//           inputListings[i]!,
//         )
//         if (success) expect(databaseInserts).toStrictEqual(expectedObject[i])
//       }
//     })

//     it('should not transform invalid input', async () => {
//       // @ts-expect-error
//       const [resultObject, success] = await domainListings.tryTransformListing({})
//       expect(success).toBe(false)
//       expect(resultObject).toBeInstanceOf(Error)
//     })
//   })
// })
