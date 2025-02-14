namespace Scrape;

using System.Collections.Immutable;
using System.Globalization;

using Model;

using Newtonsoft.Json.Linq;

using Serilog;
using Serilog.Events;

using SerilogTracing;

public class Domain
{
    /// <summary>
    /// Extract array of raw listing data from www.domain.com.au Next.js JSON.
    /// </summary>
    /// <returns>
    /// Array of listings and isLastPage, ortherwise return null.
    /// </returns>
    public (ImmutableList<JToken> listings, bool isLastPage)? ExtractAllListings(JObject inputJson)
    {
        var activity = Log.ForContext<Domain>().StartActivity("ExtractAllListings");
        try
        {
            var componentProps = inputJson.SelectToken("props.pageProps.componentProps");
            if (componentProps == null)
            {
                activity.Complete(LogEventLevel.Warning, new ArgumentException("props.pageProps.componentProps' key not found"));
                return null;
            }
            if (int.TryParse(componentProps.SelectToken("totalPages")?.ToString(), out var lastPageNumber) == false ||
                int.TryParse(componentProps.SelectToken("currentPage")?.ToString(), out var currentPageNumber) == false)
            {
                activity.Complete(LogEventLevel.Warning, new ArgumentException("cannot determine if page is last page"));
                return null;
            }
            var listings = componentProps.SelectToken("listingsMap")?.Select(listing => listing.Children().First()).ToImmutableList();
            if (listings == null)
            {
                activity.Complete(LogEventLevel.Warning, new ArgumentException("'props.pageProps.componentProps.listingsMap' key not found"));
                return null;
            }
            var isLastPage = lastPageNumber == currentPageNumber;
            activity.Complete();
            return (listings, isLastPage);
        }
        catch (Exception ex)
        {
            activity.Complete(LogEventLevel.Warning, ex);
            return null;
        }
    }

    public Home? ExtractHomeInfo(JToken listing)
    {
        var activity = Log.ForContext<Domain>().StartActivity("ExtractListingInfo");
        try
        {
            var listingModel = listing.SelectToken("listingModel");
            if (listingModel == null)
            {
                activity.Complete(LogEventLevel.Warning, new ArgumentException("listingModel' key not found"));
                return null;
            }
            var openInspectionTimeString = listingModel.SelectToken("inspection.openTime")?.ToString();
            var auctionTimeString = listingModel.SelectToken("auction")?.ToString();

            int? landSize = null;
            var parseLandSize = int.TryParse(listingModel.SelectToken("features.landSize")?.ToString(), out var landSizeRaw);
            if (parseLandSize && landSizeRaw > 0) landSize = landSizeRaw;

            var listingInfo = new Home
            {
                SourceUrl = "https://domain.com.au" + listingModel.SelectToken("url")?.ToString(),
                StreetAddress = listingModel.SelectToken("address.street")?.ToString()!,
                Latitude = double.Parse(listingModel.SelectToken("address.lat")?.ToString()!, CultureInfo.InvariantCulture),
                Longitude = double.Parse(listingModel.SelectToken("address.lng")?.ToString()!, CultureInfo.InvariantCulture),
                HomeType = Enum.Parse<HomeType>(listingModel.SelectToken("features.propertyType")?.ToString()!),
                NumberOfBedrooms = short.TryParse(listingModel.SelectToken("features.beds")?.ToString()!, out var numberOfBedrooms) ? numberOfBedrooms : (short)0,
                NumberOfBathrooms = short.TryParse(listingModel.SelectToken("features.baths")?.ToString()!, out var numberOfBathrooms) ? numberOfBathrooms : (short)0,
                NumberOfParkingSpots = short.TryParse(listingModel.SelectToken("features.parking")?.ToString()!, out var numberOfParkingSpots) ? numberOfParkingSpots : (short)0,
                LandSizeSquareMeters = landSize,
                IsRetirement = listingModel.SelectToken("features.isRetirement")?.ToString() == "True",
                IsRural = listingModel.SelectToken("features.isRural")?.ToString() == "True",
                OpenInspectionTime = DateTime.TryParse(openInspectionTimeString, out var openInspectionTime) ? openInspectionTime.ToUniversalTime() : null,
                AuctionTime = DateTime.TryParse(auctionTimeString, out var auctionTime) ? auctionTime.ToUniversalTime() : null
            };
            if (!new Validation().Validate(listingInfo))
            {
                activity.Complete(LogEventLevel.Warning, new ArgumentException("Parsed 'Home' record is invalid"));
                return null;
            }

            activity.Complete();
            return listingInfo;
        }
        catch (Exception ex)
        {
            activity.Complete(LogEventLevel.Warning, ex);
            return null;
        }
    }
}
