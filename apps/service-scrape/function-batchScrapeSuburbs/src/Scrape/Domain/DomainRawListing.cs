namespace Scrape;

using System.Collections.Immutable;
using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;

public partial class Domain
{
    /// <summary>
    /// Extract array of raw listings from Next.js JSON.
    /// Detects isLastPage for looping.
    /// </summary>
    public bool TryExtractListings(string nextJson, out ImmutableList<DomainRawListingJson.ListingsMap>? listings, out bool? isLastPage)
    {
        var activity = Log.ForContext<Domain>().StartActivity("ExtractAllListings");
        listings = null;
        isLastPage = null;
        try
        {
            var rootJson = JsonSerializer.Deserialize<DomainRawListingJson.Root>(nextJson)!;
            var currentPageNumber = rootJson.props.pageProps.componentProps.currentPage;
            var lastPageNumber = rootJson.props.pageProps.componentProps.totalPages;
            listings = rootJson.props.pageProps.componentProps.listingsMap.Select(listing => listing.Value).ToImmutableList();
            isLastPage = lastPageNumber == currentPageNumber;
            activity.Complete();
            return true;
        }
        catch (Exception ex)
        {
            activity.AddProperty("input", nextJson);
            activity.Complete(LogEventLevel.Warning, ex);
            return false;
        }
    }

    /// <summary>
    /// Convert raw listing to relevant home info.
    /// </summary>
    public bool TryExtractHome(DomainRawListingJson.ListingsMap listingMap, out Model.Home? homeInfo)
    {
        var activity = Log.ForContext<Domain>().StartActivity("ExtractHomeInfo");
        homeInfo = null;
        try
        {
            var listingModel = listingMap.listingModel;
            var home = new Model.Home
            {
                SourceUrl = "https://domain.com.au" + listingModel.url,
                StreetAddress = listingModel.address.street,
                Latitude = listingModel.address.lat,
                Longitude = listingModel.address.lng,
                HomeType = Enum.Parse<Model.HomeType>(listingModel.features.propertyType),
                NumberOfBedrooms = listingModel.features.beds,
                NumberOfBathrooms = listingModel.features.baths,
                NumberOfParkingSpots = listingModel.features.parking,
                LandSizeSquareMeters = listingModel.features.landSize == 0 ? null : listingModel.features.landSize,
                IsRetirement = listingModel.features.isRetirement,
                IsRural = listingModel.features.isRural,
                OpenInspectionTime = listingModel.inspection.openTime?.ToUniversalTime(),
                AuctionTime = listingModel.auction?.ToUniversalTime()
            };
            if (!new Model.Validation().Validate(home)) throw new ArgumentException($"Parsed 'Home' record is invalid");
            homeInfo = home;
            activity.Complete();
            return true;
        }
        catch (Exception ex)
        {
            activity.AddProperty("input", listingMap);
            activity.Complete(LogEventLevel.Warning, ex);
            return false;
        }
    }

    public bool TryExtractRentalPrice(DomainRawListingJson.ListingsMap listingMap, DateOnly scrapeDate, out Model.RentalPriceInfo? rentalPriceInfo)
    {
        var activity = Log.ForContext<Domain>().StartActivity("ExtractRentalPriceInfo");
        rentalPriceInfo = null;
        try
        {
            var price = listingMap.listingModel.price;
            var formattedPrice = Regex.Replace(price.ToString(), @"[^0-9^ ^-^.]+", "");
            var weeklyRentString = Regex.Match(formattedPrice, @"\d+").Value;
            var info = new Model.RentalPriceInfo
            {
                ScrapeDate = scrapeDate,
                WeeklyRent = short.Parse(weeklyRentString, CultureInfo.InvariantCulture)
            };
            if (!new Model.Validation().Validate(info)) throw new ArgumentException("Parsed 'RentalPriceInfo' record is invalid");
            rentalPriceInfo = info;
            activity.Complete();
            return true;
        }
        catch (Exception ex)
        {
            activity.AddProperty("input", listingMap);
            activity.Complete(LogEventLevel.Warning, ex);
            return false;
        }
    }

    public bool TryExtractSalePrice(DomainRawListingJson.ListingsMap listingMap, DateOnly scrapeDate, out Model.SalePriceInfo? salePriceInfo)
    {
        var activity = Log.ForContext<Domain>().StartActivity("SalePriceInfo");
        salePriceInfo = null;
        try
        {
            var price = listingMap.listingModel.price;
            // Expect numbers to only be separated by '-' or ' '
            var formattedPrice = Regex.Replace(price.ToString(), @"[^0-9^ ^-]+", "");
            var prices = Regex.Matches(formattedPrice, @"\d+");
            if (prices.Count != 2)
            {
                activity.AddProperty("input", listingMap);
                activity.Complete(LogEventLevel.Warning, new ArgumentException("'listingModel.price' does not have exactly 2 numbers"));
                return false;
            }
            var lowerPrice = prices[0];
            var higherPrice = prices[1];
            var info = new Model.SalePriceInfo
            {
                ScrapeDate = scrapeDate,
                LowerPrice = int.Parse(lowerPrice.Value, CultureInfo.InvariantCulture),
                HigherPrice = int.Parse(higherPrice.Value, CultureInfo.InvariantCulture)
            };
            if (!new Model.Validation().Validate(info)) throw new ArgumentException("Parsed 'SalePriceInfo' record is invalid");
            salePriceInfo = info;
            activity.Complete();
            return true;
        }
        catch (Exception ex)
        {
            activity.AddProperty("input", listingMap);
            activity.Complete(LogEventLevel.Warning, ex);
            return false;
        }
    }
}
