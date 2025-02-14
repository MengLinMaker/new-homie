namespace Scrape;

using HtmlAgilityPack;

using Newtonsoft.Json.Linq;

using Serilog;
using Serilog.Events;

using SerilogTracing;

<<<<<<< HEAD
<<<<<<< HEAD
public class Utils
=======
public static class Utils
>>>>>>> 3afe09c (feat: better error handling with with SerilogTracing)
=======
public class Utils
>>>>>>> 7d06888 (init: setup scrape service)
{
    /// <summary>
    /// Extracts JSON data from Next.js sites.
    /// </summary>
    /// <returns>
    /// The JSON JObject or null.
    /// </returns>
<<<<<<< HEAD
<<<<<<< HEAD
    public JObject? ExtractNextJson(string html)
    {
        var activity = Log.ForContext<Utils>().StartActivity("ExtractNextJson");
=======
    public static JObject? ExtractNextJson(string html)
    {
<<<<<<< HEAD
        var activity = Log.ForContext<JObject>().StartActivity("Scrape.Utils.ExtractNextJson");
>>>>>>> 3afe09c (feat: better error handling with with SerilogTracing)
=======
        var activity = Log.Logger.StartActivity("Scrape.Utils.ExtractNextJson");
>>>>>>> 544851d (chore: just use Log.Logger)
=======
    public JObject? ExtractNextJson(string html)
    {
        var activity = Log.ForContext<Utils>().StartActivity("ExtractNextJson");
>>>>>>> 7d06888 (init: setup scrape service)
        try
        {
            var htmlDocument = new HtmlDocument();
            htmlDocument.LoadHtml(html);
            var nextDataScriptNode = htmlDocument.DocumentNode.SelectSingleNode("//script[@id='__NEXT_DATA__']");
            if (nextDataScriptNode == null)
            {
                activity.Complete(LogEventLevel.Warning, new ArgumentException("Next.js JSON not found"));
                return null;
            }
            var jsonText = nextDataScriptNode.InnerText;
            activity.Complete();
            return JObject.Parse(jsonText);
        }
        catch (Exception ex)
        {
            activity.Complete(LogEventLevel.Warning, ex);
            return null;
        }
    }
}
