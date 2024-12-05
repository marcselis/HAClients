namespace HAWebSocketClient.Lib;

public class HassEventBase
{
  public string Origin { get; set; }
  public string TimeFired { get; set; }
  public Context Context { get; set; }
}