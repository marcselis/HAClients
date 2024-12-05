namespace HAWebSocketClient.Lib;

public class HassEntityBase
{
  public string EntityId { get; set; }
  public string State { get; set; }
  public string LastChanged { get; set; }
  public string LastUpdated { get; set; }
  public HassEntityAttributeBase Attributes { get; set; }
  public Context Context { get; set; }
}