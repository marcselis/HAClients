namespace HAWebSocketClient.Lib;

public class SubscribeEventCommandInFlight<TResult> : CommandInFlight
{
  public Action<TResult> Callback { get; set; }
  public Func<Task> Subscribe { get; set; }
  public Func<Task> Unsubscribe { get; set; }
}