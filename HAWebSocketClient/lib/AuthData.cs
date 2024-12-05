namespace HAWebSocketClient.Lib;

public class AuthData
{
  public string HassUrl { get; set; }
  public string ClientId { get; set; }
  public long Expires { get; set; }
  public string RefreshToken { get; set; }
  public string AccessToken { get; set; }
  public long ExpiresIn { get; set; }
}