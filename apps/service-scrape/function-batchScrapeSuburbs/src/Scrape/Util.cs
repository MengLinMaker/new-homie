namespace Scrape;

using System.Threading.Tasks;

using HtmlAgilityPack;

using Serilog;
using Serilog.Events;

using SerilogTracing;

public class Util
{
    static HttpClient? httpClient;
    public Util()
    {
        httpClient = InitHttpClient();
    }

    /// <summary>
    /// Extracts JSON data from Next.js sites.
    /// </summary>
    public bool TryExtractNextJson(string html, out string? nextJson)
    {
        var activity = Log.ForContext<Util>().StartActivity("ExtractNextJson");
        nextJson = null;
        try
        {
            var htmlDocument = new HtmlDocument();
            htmlDocument.LoadHtml(html);
            var nextDataScriptNode = htmlDocument.DocumentNode.SelectSingleNode("//script[@id='__NEXT_DATA__']");
            nextJson = nextDataScriptNode.InnerText;
            activity.Complete();
            return true;
        }
        catch (Exception ex)
        {
            activity.AddProperty("input", html);
            activity.Complete(LogEventLevel.Warning, ex);
            return false;
        }
    }

    public HttpClient InitHttpClient()
    {
        var httpClient = new HttpClient();
        httpClient.Timeout = TimeSpan.FromSeconds(3);
        return httpClient;
    }

    public async Task<string?> GetHtml(string url)
    {
        var activity = Log.ForContext<Util>().StartActivity("GetHtml");
        try
        {
            var requestMessage = new HttpRequestMessage(HttpMethod.Get, url);
            requestMessage.Headers.Referrer = new Uri("https://www.domain.com.au");
            requestMessage.Headers.Add("sec-fetch-site", "same-origin");
            Console.WriteLine(requestMessage.Headers);

            var response = await httpClient!.SendAsync(requestMessage);
            var html = response.ToString();
            activity.Complete();
            return html.Trim();
        }
        catch (Exception ex)
        {
            activity.AddProperty("url", url);
            activity.Complete(LogEventLevel.Warning, ex);
            return null;
        }
    }
}
