using Newtonsoft.Json.Linq;

namespace Test;

public class Scrape_Util
{
    [TestCase("domain.rent.dandenong-vic-3175")]
    [TestCase("domain.sale.dandenong-vic-3175")]
    public void TryExtractNextJson_FromValidHtmlInput_ReturnsJson(string fileName)
    {
        var inputContent = File.ReadAllText($"./resources/{fileName}.html");
        var success = new Scrape.Util().TryExtractNextJson(inputContent, out var nextJson);
        Assert.That(success, Is.True);
        Assert.That(nextJson, Is.Not.Null);
        var inputJson = JObject.Parse(nextJson);

        var expectedContent = File.ReadAllText($"./resources/__NEXT_DATA__.{fileName}.json");
        var expectedJson = JObject.Parse(expectedContent);
        Assert.That(expectedJson, Is.Not.Null);
        Assert.That(inputJson, Is.EqualTo(expectedJson));
    }
}
