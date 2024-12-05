namespace HAWebSocketClient.Lib;

public static class AuthFactory
{
  public static Auth CreateLongLivedTokenAuth(string hassUrl, string accessToken) => new Auth(new AuthData { HassUrl = hassUrl, ClientId = null, Expires = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() + 1e11, RefreshToken = "", AccessToken = accessToken, ExpiresIn = 1e11 });
  public static async Task<Auth> GetAuth(GetAuthOptions options = null)
  {
    options ??= new GetAuthOptions();
    AuthData data = null;
    var hassUrl = options.HassUrl?.TrimEnd('/');
    var clientId = options.ClientId ?? AuthUtils.GenClientId();
    var limitHassInstance = options.LimitHassInstance;
    if (!string.IsNullOrEmpty(options.AuthCode) && !string.IsNullOrEmpty(hassUrl))
    {
      data = await AuthUtils.FetchToken(hassUrl, clientId, options.AuthCode);
      options.SaveTokens?.Invoke(data);
    }
    if (data == null)
    {
      var query = System.Web.HttpUtility.ParseQueryString(new Uri(options.RedirectUrl).Query);
      if (query["auth_callback"] != null)
      {
        var state = AuthUtils.DecodeOAuthState(query["state"]);
        if (limitHassInstance && (state.HassUrl != hassUrl || state.ClientId != clientId)) throw new Exception(Error.INVALID_AUTH_CALLBACK.ToString());
        data = await AuthUtils.FetchToken(state.HassUrl, state.ClientId, query["code"]);
        options.SaveTokens?.Invoke(data);
      }
    }
    if (data == null && options.LoadTokens != null)
    {
      data = await options.LoadTokens();
    }
    if (data != null) return new Auth(data, options.SaveTokens);
    if (string.IsNullOrEmpty(hassUrl)) throw new Exception(Error.HASS_HOST_REQUIRED.ToString());
    AuthUtils.RedirectAuthorize(hassUrl, clientId, options.RedirectUrl ?? AuthUtils.GenRedirectUrl(), AuthUtils.EncodeOAuthState(new OAuthState { HassUrl = hassUrl, ClientId = clientId }));
    return await Task.FromResult<Auth>(null);
  }
}