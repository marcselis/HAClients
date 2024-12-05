namespace HAWebSocketClient.Lib;

public class Auth
{
  private SaveTokensFunc _saveTokens;
  public AuthData Data { get; private set; }
  public Auth(AuthData data, SaveTokensFunc saveTokens = null)
  {
    Data = data;
    _saveTokens = saveTokens;
  }
  public string WsUrl => $"ws{Data.HassUrl.Substring(4)}/api/websocket";
  public string AccessToken => Data.AccessToken;
  public bool Expired => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() > Data.Expires;
  public async Task RefreshAccessToken()
  {
    if (string.IsNullOrEmpty(Data.RefreshToken)) throw new Exception("No refresh_token");
    var data = await AuthUtils.TokenRequest(Data.HassUrl, Data.ClientId, new RefreshTokenRequest { RefreshToken = Data.RefreshToken });
    data.RefreshToken = Data.RefreshToken;
    Data = data;
    _saveTokens?.Invoke(data);
  }
  public async Task Revoke()
  {
    if (string.IsNullOrEmpty(Data.RefreshToken)) throw new Exception("No refresh_token to revoke");
    using var client = new HttpClient();
    var formData = new Dictionary<string, string> { { "token", Data.RefreshToken } };
    await client.PostAsync($"{Data.HassUrl}/auth/revoke", new FormUrlEncodedContent(formData));
    _saveTokens?.Invoke(null);
  }
}