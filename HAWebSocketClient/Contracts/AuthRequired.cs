using System.Text.Json.Serialization;

namespace HAWebSocketClient.Contracts
{
  public class AuthRequired : Message
  {
    public AuthRequired()
    {
      Type = "auth_required";

    }

    [JsonPropertyName("ha_version")]
    public string Version { get; set; }
  }
}