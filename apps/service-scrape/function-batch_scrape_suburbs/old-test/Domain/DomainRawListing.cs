namespace Test;

using System.Collections.Immutable;
using System.Text.Json;

using Newtonsoft.Json.Linq;

public class Scrape_DomainRawListing
{
    [TestCase("domain.rent.dandenong-vic-3175")]
    [TestCase("domain.sale.dandenong-vic-3175")]
    public void TryExtractListings_FromValidJsonInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/__NEXT_DATA__.{fileName}.json");
        var success = new Scrape.Domain().TryExtractListings(inputContent, out var listings, out var isLastPage);
        Assert.That(success, Is.True);
        Assert.That(listings, Is.Not.Null);
        Assert.That(isLastPage, Is.Not.Null);
        var inputListings = JToken.Parse(JsonSerializer.Serialize(listings));

        var expectedContent = File.ReadAllText($"./resources/listings.{fileName}.json");
        var expectedJson = JToken.Parse(expectedContent);
        Assert.That(expectedJson, Is.Not.Null);
        Assert.That(inputListings, Is.EqualTo(expectedJson));
    }

    [Test]
    public void TryExtractListings_InvalidInput_ReturnsNull()
    {
        var success = new Scrape.Domain().TryExtractListings("{}", out var listings, out var isLastPage);
        Assert.That(success, Is.False);
        Assert.That(listings, Is.Null);
        Assert.That(isLastPage, Is.Null);
    }

    [TestCase("domain.rent.dandenong-vic-3175")]
    [TestCase("domain.sale.dandenong-vic-3175")]
    public void TryExtractHome_FromValidJsonInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/listings.{fileName}.json");
        var listingsMap = JsonSerializer.Deserialize<ImmutableList<Scrape.DomainRawListingJson.ListingsMap>>(inputContent);
        Assert.That(listingsMap, Is.Not.Null);

        var resultContent = File.ReadAllText($"./resources/homes.{fileName}.json");
        var resultJson = JToken.Parse(resultContent).ToImmutableList();

        for (var i = 0; i < listingsMap.Count; i++)
        {
            var success = new Scrape.Domain().TryExtractHome(listingsMap[i], out var homeInfo);
            Assert.That(success, Is.True);
            Assert.That(homeInfo, Is.Not.Null);
            var actual = JToken.Parse(JsonSerializer.Serialize(homeInfo));

            var expected = resultJson[i];
            Assert.That(expected, Is.Not.Null);
            Assert.That(actual, Is.EqualTo(expected));
        }
    }

    [TestCase("domain.rent.dandenong-vic-3175")]
    public void TryExtractRentalPrice_FromValidJsonInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/listings.{fileName}.json");
        var listingsMap = JsonSerializer.Deserialize<ImmutableList<Scrape.DomainRawListingJson.ListingsMap>>(inputContent);
        Assert.That(listingsMap, Is.Not.Null);

        var resultContent = File.ReadAllText($"./resources/prices.{fileName}.json");
        var resultJson = JToken.Parse(resultContent).ToImmutableList();
        var scrapeDate = DateOnly.FromDateTime(DateTime.FromBinary(0));

        for (var i = 0; i < listingsMap.Count; i++)
        {
            new Scrape.Domain().TryExtractRentalPrice(listingsMap[i], scrapeDate, out var json);
            var actual = JToken.Parse(JsonSerializer.Serialize(json));

            var expected = resultJson[i];
            Assert.That(expected, Is.Not.Null);
            Assert.That(actual, Is.EqualTo(expected));
        }
    }

    [TestCase("domain.sale.dandenong-vic-3175")]
    public void TryExtractSalePrice_FromValidJsonInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/listings.{fileName}.json");
        var listingsMap = JsonSerializer.Deserialize<ImmutableList<Scrape.DomainRawListingJson.ListingsMap>>(inputContent);
        Assert.That(listingsMap, Is.Not.Null);

        var resultContent = File.ReadAllText($"./resources/prices.{fileName}.json");
        var resultJson = JToken.Parse(resultContent).ToImmutableList();
        var scrapeDate = DateOnly.FromDateTime(DateTime.FromBinary(0));

        for (var i = 0; i < listingsMap.Count; i++)
        {
            new Scrape.Domain().TryExtractSalePrice(listingsMap[i], scrapeDate, out var json);
            var actual = JToken.Parse(JsonSerializer.Serialize(json));

            var expected = resultJson[i];
            Assert.That(expected, Is.Not.Null);
            Assert.That(actual, Is.EqualTo(expected));
        }
    }
}
