namespace HAWebSocketClient.Lib;

public class GetAuthOptions
{
  public string HassUrl { get; set; }
  public string ClientId { get; set; }
  public string RedirectUrl { get; set; }
  public string AuthCode { get; set; }
  public SaveTokensFunc SaveTokens { get; set; }
  public LoadTokensFunc LoadTokens { get; set; }
  public bool LimitHassInstance { get; set; }
}