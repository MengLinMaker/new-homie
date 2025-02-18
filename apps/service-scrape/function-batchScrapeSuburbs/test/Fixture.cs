namespace Test;

using Serilog;

using SerilogTracing.Expressions;

[SetUpFixture]
public class SetupAll
{
    [OneTimeSetUp]
    public void RunBeforeAnyTests()
    {
        Log.Logger = new LoggerConfiguration()
       .WriteTo.Console(Formatters.CreateConsoleTextFormatter())
       .CreateLogger();
    }
}
