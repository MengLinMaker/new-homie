namespace Model;

using System.ComponentModel.DataAnnotations;

using Serilog;
using Serilog.Events;

using SerilogTracing;

// Used across multiple homes
public class Suburb
{
    [MaxLength(128)] // Longest suburb name in the world is 85 characters: "taumatawhakatangihangakoauauotamateapokaiwhenuakitanatahu".
    public required string SuburbName { get; init; }
    [MaxLength(16)] // String to allow for "0000" postcodes. Longest Postcode is 10 digits from Iran.
    public required string Postcode { get; init; }
    [MaxLength(16)]
    public required string State { get; init; }
    // Set later on as info is not readily available
    [Range(-90, 90)]
    public required double? Latitude { get; set; }
    [Range(-180, 180)]
    public required double? Longitude { get; set; }
};

public enum HomeType
{
    ApartmentUnitFlat,
    House,
    Townhouse,
    BlockOfUnits,
}

// Home details should rarely change over time
public class Home
{
    // Metadata
    [MaxLength(256)]
    public required string SourceUrl { get; init; }
    [MaxLength(64)]
    public required string StreetAddress { get; init; } // Max street length appears to be 40 characters.
    public required Suburb SuburbAddress { get; init; }
    [Range(-90, 90)]
    public required double Latitude { get; init; }
    [Range(-180, 180)]
    public required double Longitude { get; init; }
    // Features
    public required HomeType HomeType { get; init; }
    [Range(0, 32767)]
    public required short NumberOfBedrooms { get; init; }
    [Range(0, 32767)]
    public required short NumberOfBathrooms { get; init; }
    [Range(0, 32767)]
    public required short NumberOfParkingSpots { get; init; }
    [Range(1, 2147483647)]
    public int? LandSizeSquareMeters { get; init; } // Round to nearest meter square.
    public bool IsRetirement { get; init; }
    public bool IsRural { get; init; }
    // Inspection - To determine actively selling homes
    public DateTime? OpenInspectionTime { get; init; }
    public DateTime? AuctionTime { get; init; }
};

// Expect lots of listing class in database. Kepp small to reduce storage.
public class RentalListingInfo
{
    public required DateOnly ScrapeDate { get; init; } // 4 bytes compared to timestamp's 8 bytes.
    [Range(0, 32767)] public required short WeeklyRent { get; init; }
};
public class SaleListingInfo
{
    public required DateOnly ScrapeDate { get; init; }
    [Range(0, 2147483647)] public required int LowerPrice { get; init; }
    [Range(0, 2147483647)] public required int HigherPrice { get; init; }
};

public class Validation
{
    public bool Validate<T>(T entity) where T : class
    {
        var activity = Log.ForContext<Validation>().StartActivity("Validate");

        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(entity);
        var validationStatus = Validator.TryValidateObject(entity, validationContext, validationResults, true);

        if (!validationStatus) activity.Complete(LogEventLevel.Error, new ArgumentException($"Validation.Validate error: {entity.GetType()} {validationResults}"));
        activity.Complete();
        return validationStatus;
    }
}
