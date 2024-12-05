namespace HAWebSocketClient.Lib;

public class HassService
{
  public string Name { get; set; }
  public string Description { get; set; }
  public object Target { get; set; }
  public Dictionary<string, ServiceField> Fields { get; set; }
  public ServiceResponse Response { get; set; }
}