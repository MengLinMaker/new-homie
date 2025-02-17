namespace Scrape;

using HtmlAgilityPack;

using Newtonsoft.Json.Linq;

using Serilog;
using Serilog.Events;

using SerilogTracing;

public class Utils
{
    /// <summary>
    /// Extracts JSON data from Next.js sites.
    /// </summary>
    /// <returns>
    /// The JSON JObject or null.
    /// </returns>
    public JObject? ExtractNextJson(string html)
    {
        var activity = Log.ForContext<Utils>().StartActivity("ExtractNextJson");
        try
        {
            var htmlDocument = new HtmlDocument();
            htmlDocument.LoadHtml(html);
            var nextDataScriptNode = htmlDocument.DocumentNode.SelectSingleNode("//script[@id='__NEXT_DATA__']");
            if (nextDataScriptNode == null)
            {
                activity.AddProperty("input", html);
                activity.Complete(LogEventLevel.Warning, new ArgumentException("Next.js JSON not found"));
                return null;
            }
            var jsonText = nextDataScriptNode.InnerText;
            activity.Complete();
            return JObject.Parse(jsonText);
        }
        catch (Exception ex)
        {
            activity.AddProperty("input", html);
            activity.Complete(LogEventLevel.Warning, ex);
            return null;
        }
    }
}
