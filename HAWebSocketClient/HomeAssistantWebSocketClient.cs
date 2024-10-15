using Microsoft.Extensions.Logging;
using Websocket.Client;

namespace HAWebSocketClient
{
  internal class HomeAssistantWebSocketClient : IHomeAssistantClient
  {
    private readonly ILogger<HomeAssistantWebSocketClient> _logger;
    private readonly HaClient _client;

    public HomeAssistantWebSocketClient(ILogger<HomeAssistantWebSocketClient> logger, HaClient client)
    {
      _logger = logger;
      _client = client;
      //_client.OnMessageReceived = ProcessMessage;
    }

    public async Task RunAsync()
    {
      await _client.StartAsync().ConfigureAwait(false);
      await Task.Delay(TimeSpan.FromHours(1)).ConfigureAwait(false);

    }

    private void ProcessMessage(ResponseMessage message)
    {
    }
  }
}
