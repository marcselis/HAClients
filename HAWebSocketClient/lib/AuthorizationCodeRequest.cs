namespace HAWebSocketClient.Lib;

public class AuthorizationCodeRequest
{
  public string GrantType { get; set; } = "authorization_code";
  public string Code { get; set; }
}