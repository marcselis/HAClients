using System.Net.WebSockets;
using System.Text;
using HAWebSocketClient.Contracts;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Websocket.Client;

namespace HAWebSocketClient
{
  internal class HaClient :IDisposable
  {
    private readonly ILogger<HaClient> _logger;
    private readonly string _authorizationToken;
    private readonly Uri _uri;
    private readonly WebsocketClient _client;
    private readonly IDisposable _subscription;

    public HaClient(ILogger<HaClient> logger, string baseUrl, string authorizationToken)
    {
      _logger = logger;
      _authorizationToken = authorizationToken;
      var uri = baseUrl.Replace("https", "wss").Replace("http", "ws")+"/api/websocket";
      _client = new WebsocketClient(new Uri(uri))
        { ReconnectTimeout = TimeSpan.FromSeconds(30), MessageEncoding = Encoding.UTF8 };
      _client.ReconnectionHappened.Subscribe(info => _logger.LogInformation("Reconnection happened, type: {Type}", info.Type));
      _subscription = _client.MessageReceived.Subscribe(ProcessMessage);
    }

    public async Task StartAsync()
    {
      await _client.Start();
      await Subscribe();
    }

    private async Task Subscribe()
    {
      Send(new SubscribeToStateChanged());
    }

    public Task<bool> StopAsync()
    {
      _logger.LogInformation("Stop requested");
      return _client.Stop(WebSocketCloseStatus.NormalClosure, "stop requested");
    }

    public void Dispose()
    {
      _subscription.Dispose();
      _client.Dispose();
    }

    private void ProcessMessage(ResponseMessage message)
    {
      _logger.LogInformation("Message received: {message}", message);
      Message msg = JsonSerializer.Deserialize<Message>(message.Text);
      switch (msg.Type)
      {
        case "auth_required":
          Reply(new HAWebSocketClient.Contracts.Auth {AccessToken = _authorizationToken});
          break;
        case "auth_ok":
          _logger.LogInformation("Authentication OK");
          break;
        case "result":
          var result = JsonSerializer.Deserialize<Result>(message.Text);
          break;
        default:
          _logger.LogWarning("Unexpected message {Type} received", msg.Type);
          break;
      }
    }

    private void Reply(Response message)
    {
      var msg = JsonSerializer.Serialize(message);
      _client.Send(msg);
    }

    private void Send(Command command)
    {
      var msg = JsonSerializer.Serialize(command);
      _client.Send(msg);
    }
  }
}