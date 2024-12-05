namespace HAWebSocketClient.Lib;

public class HassEntityAttributeBase
{
  public string FriendlyName { get; set; }
  public string UnitOfMeasurement { get; set; }
  public string Icon { get; set; }
  public string EntityPicture { get; set; }
  public int? SupportedFeatures { get; set; }
  public bool? Hidden { get; set; }
  public bool? AssumedState { get; set; }
  public string DeviceClass { get; set; }
  public string StateClass { get; set; }
  public bool? Restored { get; set; }
}