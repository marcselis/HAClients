using System.Text.Json.Serialization;

namespace HAWebSocketClient.Contracts
{
  public class Message
  {
    [JsonPropertyName("type")]
    public string Type { get; set; }
  }

  public class Result : Message
  {
    public Result()
    {
      Type = "result";
    }

    [JsonPropertyName("id")]
    public uint Id { get; set; }

    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("error")]
    public Error Error { get; set; }
  }

  public record Error(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")]
    string Message,
    [property: JsonPropertyName("translation_key")]
    string TranslationKey,
    [property: JsonPropertyName("translation_domain")]
    string TranslationDomain,
    [property: JsonPropertyName("translation_placeholders")]
    Dictionary<string, string> TranslationPlaceHolders)
  {
  }
}