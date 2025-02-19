namespace Scrape.DomainRawListingJson;

// Extract home and price info
public record Inspection
(
    DateTime? openTime,
    DateTime? closeTime
);
public record Features
(
    int? beds,
    int? baths,
    int? parking,
    string propertyType,
    bool isRural,
    int landSize,
    bool isRetirement
);
public record Address
(
    string street,
    float lat,
    float lng
);
public record ListingModel(
    string url,
    string price,
    Address address,
    Features features,
    Inspection inspection,
    DateTime? auction
);
public record ListingsMap(ListingModel listingModel);

// Root of raw www.domain.au json
public record ComponentProps(
    int currentPage,
    int totalPages,
    Dictionary<string, ListingsMap> listingsMap
);
public record PageProps(ComponentProps componentProps);
public record Props(PageProps pageProps);
public record Root(Props props);
