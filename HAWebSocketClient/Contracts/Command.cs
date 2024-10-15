using System.Text.Json.Serialization;

namespace HAWebSocketClient.Contracts
{
  [JsonDerivedType(typeof(SubscribeToEvents))]
  [JsonDerivedType(typeof(SubscribeToStateChanged))]
  public abstract class Command
  {
    private static uint Counter = 0;

    public Command()
    {
      Id = ++Counter;
    }

    public Command(string type) : this()
    {
      Type = type;
    }

    [JsonPropertyName("id")]
    public uint Id { get; set; }
    [JsonPropertyName("type")]
    public string Type { get; set; }
  }
}
