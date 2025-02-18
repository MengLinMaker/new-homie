namespace Scrape;

using HtmlAgilityPack;

using Serilog;
using Serilog.Events;

using SerilogTracing;

public class Util
{
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
}
