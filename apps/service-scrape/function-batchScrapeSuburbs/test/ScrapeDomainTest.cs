namespace Test;

using System.Collections.Immutable;
using System.Text.Json;

using Newtonsoft.Json.Linq;

using Serilog;

using SerilogTracing.Expressions;

public class ScrapeDomainTest
{
    [SetUp]
    public void Setup()
    {
        Log.Logger = new LoggerConfiguration()
        .WriteTo.Console(Formatters.CreateConsoleTextFormatter())
        .CreateLogger();
    }

    [TestCase("domain.rent.dandenong-vic-3175")]
    [TestCase("domain.sale.dandenong-vic-3175")]
    public void ExtractNextJson_FromValidHtmlInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/{fileName}.html");
        var inputJson = new Scrape.Utils().ExtractNextJson(inputContent);

        var expectedContent = File.ReadAllText($"./resources/__NEXT_DATA__.{fileName}.json");
        var expectedJson = JObject.Parse(expectedContent);
        Assert.That(expectedJson, Is.Not.Null);
        Assert.That(inputJson, Is.EqualTo(expectedJson));
    }

    [Test]
    public void ExtractNextJson_InvalidInput_ReturnsNull()
    {
        var json = new Scrape.Utils().ExtractNextJson("invalid");
        Assert.That(json, Is.Null);
    }

    [TestCase("domain.rent.dandenong-vic-3175")]
    [TestCase("domain.sale.dandenong-vic-3175")]
    public void ExtractAllListings_FromValidJsonInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/__NEXT_DATA__.{fileName}.json");
        var inputJson = JObject.Parse(inputContent);
        var result = new Scrape.Domain().ExtractAllListings(inputJson);
        var (listings, isLastPage) = result!.Value;

        var expectedContent = File.ReadAllText($"./resources/listings.{fileName}.json");
        var expectedJson = JToken.Parse(expectedContent).ToImmutableList();
        Assert.That(expectedJson, Is.Not.Null);
        Assert.That(listings, Is.EqualTo(expectedJson));
    }

    [Test]
    public void ExtractAllListings_InvalidInput_ReturnsNull()
    {
        var json = JObject.Parse("{}");
        var result = new Scrape.Domain().ExtractAllListings(json);
        Assert.That(result, Is.Null);
    }

    [TestCase("domain.rent.dandenong-vic-3175")]
    [TestCase("domain.sale.dandenong-vic-3175")]
    public void ExtractHomeInfo_FromValidJsonInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/listings.{fileName}.json");
        var inputJson = JToken.Parse(inputContent).ToImmutableList();

        var resultContent = File.ReadAllText($"./resources/homes.{fileName}.json");
        var resultJson = JToken.Parse(resultContent).ToImmutableList();

        for (var i = 0; i < inputJson.Count; i++)
        {
            var expected = resultJson[i];
            var json = new Scrape.Domain().ExtractHomeInfo(inputJson[i]);
            var actual = JToken.Parse(JsonSerializer.Serialize(json));
            Assert.That(expected, Is.Not.Null);
            Assert.That(actual, Is.EqualTo(expected));
        }
    }
}
