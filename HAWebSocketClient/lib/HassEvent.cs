namespace HAWebSocketClient.Lib;

public class HassEvent : HassEventBase
{
  public string EventType { get; set; }
  public Dictionary<string, object> Data { get; set; }
}