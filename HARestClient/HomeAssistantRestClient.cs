using System.Net.Http.Json;
using HARestClient.Contracts;

namespace HARestClient
{
  internal class HomeAssistantRestClient(HttpClient httpClient) : IHomeAssistantClient
  {
    private readonly HttpClient _httpClient = httpClient;

    public async Task RunAsync()
    {
      if (!await IsRunningAsync().ConfigureAwait(false))
      {
        Console.WriteLine("HA is not running");
        return;
      }
      var response = await GetConfigurationAsync().ConfigureAwait(false);
      Console.WriteLine($"HA version {response.Version} is running!");
    }

    public Task<ConfigurationResponse?> GetConfigurationAsync()
    {
      return _httpClient.GetFromJsonAsync<ConfigurationResponse>("config");
    }

    public async Task<bool> IsRunningAsync()
    {
      var response = await _httpClient.GetFromJsonAsync<PingResponse>("").ConfigureAwait(false);
      return response?.Message == "API running.";
    }
  }
}