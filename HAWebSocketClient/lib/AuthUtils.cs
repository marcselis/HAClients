using System.Text.Json;

namespace HAWebSocketClient.Lib;

public static class AuthUtils
{
  public static string GenClientId() => $"{Uri.UriSchemeHttp}://{Environment.MachineName}/";
  public static long GenExpires(long expiresIn) => expiresIn * 1000 + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
  public static string GenRedirectUrl() => $"{Uri.UriSchemeHttp}://{Environment.MachineName}/";
  public static string GenAuthorizeUrl(string hassUrl, string clientId, string redirectUrl, string state)
  {
    var authorizeUrl = $"{hassUrl}/auth/authorize?response_type=code&redirect_uri={Uri.EscapeDataString(redirectUrl)}";
    if (clientId != null) authorizeUrl += $"&client_id={Uri.EscapeDataString(clientId)}";
    if (state != null) authorizeUrl += $"&state={Uri.EscapeDataString(state)}";
    return authorizeUrl;
  }
  public static void RedirectAuthorize(string hassUrl, string clientId, string redirectUrl, string state)
  {
    redirectUrl += (redirectUrl.Contains("?") ? "&" : "?") + "auth_callback=1";
    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
    {
      FileName = GenAuthorizeUrl(hassUrl, clientId, redirectUrl, state),
      UseShellExecute = true
    });
  }
  public static async Task<AuthData> TokenRequest(string hassUrl, string clientId, object data)
  {
    using var client = new HttpClient();
    var formData = new Dictionary<string, string>();
    if (clientId != null) formData.Add("client_id", clientId);
    foreach (var prop in data.GetType().GetProperties())
    {
      formData.Add(prop.Name, prop.GetValue(data)?.ToString());
    }
    var response = await client.PostAsync($"{hassUrl}/auth/token", new FormUrlEncodedContent(formData));
    if (!response.IsSuccessStatusCode)
    {
      throw new Exception(response.StatusCode == System.Net.HttpStatusCode.BadRequest || response.StatusCode == System.Net.HttpStatusCode.Forbidden ? Error.INVALID_AUTH.ToString() : "Unable to fetch tokens");
    }
    var tokens = JsonSerializer.Deserialize<AuthData>(await response.Content.ReadAsStringAsync());
    tokens.HassUrl = hassUrl;
    tokens.ClientId = clientId;
    tokens.Expires = GenExpires(tokens.ExpiresIn);
    return tokens;
  }
  public static Task<AuthData> FetchToken(string hassUrl, string clientId, string code) => TokenRequest(hassUrl, clientId, new AuthorizationCodeRequest { Code = code });
  public static string EncodeOAuthState(OAuthState state) => Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(state)));
  public static OAuthState DecodeOAuthState(string encoded) => JsonSerializer.Deserialize<OAuthState>(System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(encoded)));
}