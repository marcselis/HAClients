namespace HAWebSocketClient.Lib;

public class WebSocketResponse
{
  public int Id { get; set; }
  public string Type { get; set; }
  public bool Success { get; set; }
  public object Result { get; set; }
  public WebSocketError Error { get; set; }
  public string HaVersion { get; set; }
  public object Event { get; set; }
}