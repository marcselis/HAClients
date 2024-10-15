using HARestClient;
using HAWebSocketClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Reflection;

Console.WriteLine("Hello, World!");
var builder = Host.CreateDefaultBuilder();
builder.ConfigureAppConfiguration((ctx, bld) => bld.AddUserSecrets(Assembly.GetExecutingAssembly()));
builder.ConfigureServices(ConfigureServices);
builder.ConfigureLogging(ConfigureLogging);
var app = builder.Build();
var client = app.Services.GetRequiredService<IHomeAssistantClient>();
await client.RunAsync().ConfigureAwait(false);
return;

void ConfigureServices(HostBuilderContext _, IServiceCollection serviceCollection)
{
  serviceCollection.AddSingleton<IHomeAssistantClient, HomeAssistantWebSocketClient>();
  serviceCollection.AddSingleton<Settings>();
  serviceCollection.AddSingleton<HaClient>(svc =>
  {
    var settings = svc.GetRequiredService<Settings>();

    return new HaClient(svc.GetRequiredService<ILogger<HaClient>>(), settings.HomeAssistantUri,settings.AuthorizationToken);
  });
}

void ConfigureLogging(ILoggingBuilder builder)
{
  builder.AddConsole();
}