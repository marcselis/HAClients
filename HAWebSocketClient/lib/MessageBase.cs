namespace HAWebSocketClient.Lib;

public class MessageBase
{
  public int? Id { get; set; }
  public string? Type { get; set; }
  public Dictionary<string, object> AdditionalProperties { get; set; } = [];
}