namespace HAWebSocketClient.Lib;

public class StateChangedData
{
  public string EntityId { get; set; }
  public HassEntity NewState { get; set; }
  public HassEntity OldState { get; set; }
}