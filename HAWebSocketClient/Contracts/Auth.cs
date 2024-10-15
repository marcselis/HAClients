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

    public Auth(string accessToken) : this()
    {
      AccessToken = accessToken;
    }

    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; }
  }
}
