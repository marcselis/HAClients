using System.Text.Json.Serialization;

namespace HAWebSocketClient.Contracts
{
  internal class Auth : Response
  {
    [JsonConstructor]
    public Auth()
    {
      Type = "auth";
    }

    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }
  }
}
