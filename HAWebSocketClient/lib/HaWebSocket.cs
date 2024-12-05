using Websocket.Client;

namespace HAWebSocketClient.Lib;

public class HaWebSocket : WebsocketClient
{
  public string HaVersion { get; set; }
  public HaWebSocket(string url) : base(new Uri(url)) { }
}