namespace HAWebSocketClient.Lib;

public class CommandInFlight
{
  public Action<object> Resolve { get; set; }
  public Action<Exception> Reject { get; set; }
}