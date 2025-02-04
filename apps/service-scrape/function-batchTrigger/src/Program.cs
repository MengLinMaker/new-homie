using System.Text.Json;

using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;

// Enable conversion from Lambda JSON input to .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]
namespace Program;

public class LambdaFunction
{
    public static APIGatewayProxyResponse LambdaFunctionHandler(APIGatewayProxyRequest apigProxyEvent, ILambdaContext context)
    {
        var body = new Dictionary<string, string>
        {
            { "message", "hello world" },
        };
        return new APIGatewayProxyResponse
        {
            Body = JsonSerializer.Serialize(body),
            StatusCode = 200,
            Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
        };
    }
}