using System.Text.Json.Serialization;

namespace HAWebSocketClient.Contracts
{
  [JsonDerivedType(typeof(Auth))]
  public abstract class Response
  {
    [JsonPropertyName("type")]
    public string Type { get; set; }
  }
}