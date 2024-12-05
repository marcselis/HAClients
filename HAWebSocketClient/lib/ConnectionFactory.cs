using System.Text.Json;

namespace HAWebSocketClient.Lib;

public static class ConnectionFactory
{
  public static async Task<Connection> CreateConnection(ConnectionOptions options = null)
  {
    options ??= new ConnectionOptions { SetupRetry = 0, CreateSocket = CreateSocket };
    var socket = await options.CreateSocket(options);
    return new Connection(socket, options);
  }
  public static async Task<HaWebSocket> CreateSocket(ConnectionOptions options)
  {
    if (options.Auth == null)
      throw new Exception(Error.HASS_HOST_REQUIRED.ToString());
    var auth = options.Auth;
    var authRefreshTask = auth.Expired ? auth.RefreshAccessToken().ContinueWith(t => { }) : null;
    var url = auth.WsUrl;
    var socket = new HaWebSocket(url);
    var invalidAuth = false;
    var closeMessage = new Action(() =>
    {
      socket.OnClose -= closeMessage;
      if (invalidAuth)
        throw new Exception(Error.INVALID_AUTH.ToString());
      if (options.SetupRetry == 0)
        throw new Exception(Error.CANNOT_CONNECT.ToString());
      Task.Delay(1000).ContinueWith(_ => CreateSocket(options));
    });
    var handleOpen = new Action(async () =>
    {
      try
      {
        if (auth.Expired)
          await (authRefreshTask ?? auth.RefreshAccessToken());
        socket.Send(JsonSerializer.Serialize(new { type = "auth", access_token = auth.AccessToken }));
      }
      catch (Exception ex)
      {
        invalidAuth = ex.Message == Error.INVALID_AUTH.ToString();
        socket.Close();
      }
    });
    var handleMessage = new Action<MessageEventArgs>(e =>
    {
      var message = JsonSerializer.Deserialize<WebSocketResponse>(e.Data);
      switch (message.Type)
      {
        case "auth_invalid":
          invalidAuth = true;
          socket.Close();
          break;
        case "auth_ok":
          socket.OnOpen -= handleOpen;
          socket.OnMessage -= handleMessage;
          socket.OnClose -= closeMessage;
          socket.HaVersion = message.HaVersion;
          if (AuthUtils.AtLeastHaVersion(socket.HaVersion, 2022, 9))
            socket.Send(JsonSerializer.Serialize(new { type = "supported_features", id = 1, features = new { coalesce_messages = 1 } }));
          break;
        default:
          Console.WriteLine($"Unhandled message {message.Type}");
          break;
      }
    });
    socket.OnOpen += handleOpen;
    socket.MessageReceived.Subscribe((msg)=>handleMessage(msg));
    socket.OnClose += closeMessage;
    return await Task.FromResult(socket);
  }
}