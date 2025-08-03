package org.scrape.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Collection;
import org.Result;
import org.jboss.logging.Logger;
import org.scrape.JsonUtil;

@ApplicationScoped
public class ListingsProcessor {
    final Logger LOG = Logger.getLogger(ListingsProcessor.class);

    @Inject
    ObjectMapper objectMapper = JsonUtil.objectMapper;

    @Inject
    Validator validator;

    @WithSpan
    public Result<org.scrape.domain.NextDataListingsSchema.Root> tryParseNextJson(String json) {
        try {
            var validJson = objectMapper.readValue(json, org.scrape.domain.NextDataListingsSchema.Root.class);
            validator.validate(validJson);
            return Result.ok(validJson);
        } catch (Exception e) {
            LOG.error(null, e);
            return Result.fail(e);
        }
    }

    public Collection<org.scrape.generated.domain.RawListingsSchema.Root> extractListings(
            org.scrape.domain.NextDataListingsSchema.Root validNextjson) {
        var listings = validNextjson.props.pageProps.componentProps.listingsMap.values();
        return listings;
    }

    public Boolean isLastPage(org.scrape.domain.NextDataListingsSchema.Root validNextjson) {
        var currentPageNumber = validNextjson.props.pageProps.componentProps.currentPage;
        var lastPageNumber = validNextjson.props.pageProps.componentProps.totalPages;
        var isLastPage = lastPageNumber == currentPageNumber;
        return isLastPage;
    }
}

// export const domainListings = {

//   /**
//    * @description Extract array of raw listings from Next.js JSON.
//    * @description Detects isLastPage for looping.
//    * @param nextDataJson
//    */
//   tryExtractListings(nextDataJson: object) {
//     return traceTryFunction('domainListings.tryExtractListings', arguments, 'ERROR', async () => {
//       const validNextjson = domainListings.nextDataJsonSchema.parse(nextDataJson)
//       const currentPageNumber = validNextjson.props.pageProps.componentProps.currentPage
//       const lastPageNumber = validNextjson.props.pageProps.componentProps.totalPages
//       const listings = Object.values(validNextjson.props.pageProps.componentProps.listingsMap)
//       const isLastPage = lastPageNumber === currentPageNumber
//       return [listings, isLastPage]
//     })
//   },

//   /**
//    * @description Transform listing json data for database table inserts
//    * @param listing
//    * @returns Object containing tables for database inserts
//    */
//   tryTransformListing(listing: z.infer<typeof rawListingsSchema>) {
//     return traceTryFunction('domainListings.tryTransformListing', arguments, 'ERROR', async () => {
//       const listingModel = listing.listingModel
//       const address = listingModel.address
//       const features = listingModel.features
//       return {
//         common_features_table: dbSchema.common_features_table.parse({
//           bed_quantity: features.beds ?? 0,
//           bath_quantity: features.baths ?? 0,
//           car_quantity: features.parking ?? 0,
//           home_type: features.propertyType as any,
//           is_retirement: features.isRetirement,
//         } satisfies z.infer<typeof dbSchema.common_features_table>),
//         home_table: dbSchema.home_table.parse({
//           street_address: address.street,
//           gps: [address.lat, address.lng],
//           land_m2: features.landSize === 0 ? null : features.landSize,
//           inspection_time: toPgDatetime(listingModel.inspection.openTime),
//           auction_time: toPgDatetime(listingModel.auction),
//         } satisfies z.infer<typeof dbSchema.home_table>),
//       }
//     })
//   },

//   /**
//    * @description Get sale price info
//    * @param listing
//    * @returns Object containing tables for database inserts
//    */
//   tryTransformSalePrice(listing: z.infer<typeof rawListingsSchema>) {
//     return traceTryFunction('domainListings.tryTransformSalePrice', arguments, 'WARN', async () => {
//       const beds = listing.listingModel.features.beds ?? 0
//       const land = listing.listingModel.features.landSize
//       const priceString = listing.listingModel.price
//       const price = scrapeUtil.highestPriceFromString(priceString)

//       if (!price) throw Error('no price in listing.listingModel.price')
//       return {
//         sale_price_table: dbSchema.sale_price_table.parse({
//           first_scrape_date: '',
//           last_scrape_date: '',
//           higher_price_aud: price,
//           aud_per_bed: beds > 0 ? Math.round(price / beds) : null,
//           aud_per_land_m2: land > 0 ? Math.round(price / land) : null,
//         } satisfies z.infer<typeof dbSchema.sale_price_table>),
//       }
//     })
//   },

//   /**
//    * @description Get rent price info
//    * @param listing
//    * @returns Object containing tables for database inserts
//    */
//   tryTransformRentPrice(listing: z.infer<typeof rawListingsSchema>) {
//     return traceTryFunction('domainListings.tryTransformRentPrice', arguments, 'WARN', async () => {
//       const beds = listing.listingModel.features.beds ?? 0
//       const priceString = listing.listingModel.price
//       const price = scrapeUtil.highestPriceFromString(priceString)

//       if (!price) throw Error('no price in listing.listingModel.price')
//       return {
//         rent_price_table: dbSchema.rent_price_table.parse({
//           first_scrape_date: '',
//           last_scrape_date: '',
//           weekly_rent_aud: price,
//           aud_per_bed: beds > 0 ? Math.round(price / beds) : null,
//         } satisfies z.infer<typeof dbSchema.rent_price_table>),
//       }
//     })
//   },
// }
