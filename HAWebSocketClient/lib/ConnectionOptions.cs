namespace HAWebSocketClient.Lib;

public class ConnectionOptions
{
  public int SetupRetry { get; set; }
  public Auth Auth { get; set; }
  public Func<ConnectionOptions, Task<HaWebSocket>> CreateSocket { get; set; }
}