namespace HAWebSocketClient.Lib;

public class SubscribeEventMessage : MessageBase
{
  public string EventType { get; set; }
}