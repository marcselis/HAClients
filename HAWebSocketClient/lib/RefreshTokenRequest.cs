namespace HAWebSocketClient.Lib;

public class RefreshTokenRequest
{
  public string GrantType { get; set; } = "refresh_token";
  public string RefreshToken { get; set; }
}