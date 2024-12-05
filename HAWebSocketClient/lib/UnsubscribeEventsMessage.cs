namespace HAWebSocketClient.Lib;

public class UnsubscribeEventsMessage : MessageBase
{
  public int Subscription { get; set; }
}