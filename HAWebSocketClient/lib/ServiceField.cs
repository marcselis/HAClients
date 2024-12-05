namespace HAWebSocketClient.Lib;

public class ServiceField
{
  public object Example { get; set; }
  public object Default { get; set; }
  public bool? Required { get; set; }
  public bool? Advanced { get; set; }
  public object Selector { get; set; }
  public Dictionary<string, List<object>> Filter { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
}