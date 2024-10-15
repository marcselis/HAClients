// See https://aka.ms/new-console-template for more information

using System.Net.Http.Headers;
using System.Reflection;
using HARestClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateDefaultBuilder();
builder.ConfigureAppConfiguration((ctx, bld) => bld.AddUserSecrets(Assembly.GetExecutingAssembly()));
builder.ConfigureServices(ConfigureServices);
var app=  builder.Build();
var client = app.Services.GetRequiredService<IHomeAssistantClient>();
await client.RunAsync().ConfigureAwait(false);
return;

static void ConfigureServices(HostBuilderContext _, IServiceCollection serviceCollection)
{
  serviceCollection.AddSingleton<IHomeAssistantClient, HomeAssistantRestClient>();
  serviceCollection.AddSingleton<Settings>();
  serviceCollection.AddHttpClient<IHomeAssistantClient, HomeAssistantRestClient>((IServiceProvider svc,HttpClient client)=>ConfigureHttpClient(svc,client));
  return;

  static void ConfigureHttpClient(IServiceProvider services, HttpClient httpClient)
  {
    var settings = services.GetRequiredService<Settings>();
    httpClient.BaseAddress = new Uri(new Uri(settings.HomeAssistantUri), "/api/");
    httpClient.DefaultRequestHeaders.Authorization =
      new AuthenticationHeaderValue("Bearer", settings.AuthorizationToken);
  }
}