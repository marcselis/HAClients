namespace HAWebSocketClient.Contracts;

public class SubscribeToStateChanged : SubscribeToEvents
{
  public SubscribeToStateChanged() : base("state_changed")
  {
  }
}