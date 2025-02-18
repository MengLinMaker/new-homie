using Serilog;

using SerilogTracing;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
builder.Host.UseSerilog((context, config) =>
{
    config.ReadFrom.Configuration(context.Configuration);
    // Enable SerilogTracing
    new ActivityListenerConfiguration()
        .Sample.AllTraces()
        .Instrument.AspNetCoreRequests(opts =>
        {
            opts.IncomingTraceParent = IncomingTraceParent.Trust;
        })
        .Instrument.HttpClientRequests()
        .TraceToSharedLogger();
});

var app = builder.Build();
app.MapGet("/", (HttpContext context) =>
{
    var activity1 = Log.ForContext<HttpContext>().StartActivity("Activity 1");
    var activity2 = Log.Logger.StartActivity("Activity 2");
    activity2.Complete();
    activity1.Complete();
    return Results.Ok("Hello");
});
app.Run();
