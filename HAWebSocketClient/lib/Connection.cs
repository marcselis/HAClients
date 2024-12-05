using System;
using System.Net.WebSockets;
using System.Reflection.Metadata;
using System.Text.Json;
using Websocket.Client;

namespace HAWebSocketClient.Lib;

public class Connection
{
  public ConnectionOptions Options { get; private set; }
  public int CommandId { get; private set; } = 2;
  public Dictionary<int, CommandInFlight> Commands { get; private set; } = new Dictionary<int, CommandInFlight>();
  public Dictionary<string, List<Action<Connection, object>>> EventListeners { get; private set; } = new Dictionary<string, List<Action<Connection, object>>>();
  public bool CloseRequested { get; private set; }
  public Task SuspendReconnectPromise { get; private set; }
  public Dictionary<int, CommandInFlight> OldSubscriptions { get; private set; }
  public List<TaskCompletionSource<object>> QueuedMessages { get; private set; }
  public HaWebSocket? Socket { get; private set; }
  public string HaVersion { get; private set; }
  public Connection(HaWebSocket socket, ConnectionOptions options)
  {
    Options = options;
    SetSocket(socket);
  }
  public bool Connected => Socket != null && Socket.ReadyState == WebSocketState.Open;
  private void SetSocket(HaWebSocket socket)
  {
    Socket = socket;
    HaVersion = socket.HaVersion;
    socket.MessageReceived.Subscribe(HandleMessage);
    socket.OnClose += HandleClose;
    if (OldSubscriptions != null)
    {
      OldSubscriptions = null;
      foreach (var info in OldSubscriptions.Values)
      {
        if (info is SubscribeEventCommandInFlight subscribeInfo && subscribeInfo.Subscribe != null)
        {
          subscribeInfo.Subscribe().ContinueWith(t => subscribeInfo.Unsubscribe = t.Result);
          subscribeInfo.Resolve();
        }
      }
    }
    if (QueuedMessages != null)
    {
      var queuedMessages = QueuedMessages;
      QueuedMessages = null;
      foreach (var msg in queuedMessages)
        msg.SetResult(null);
    }
    FireEvent("ready");
  }
  public void AddEventListener(string eventType, Action<Connection, object> callback)
  {
    if (!EventListeners.ContainsKey(eventType))
      EventListeners[eventType] = new List<Action<Connection, object>>();
    EventListeners[eventType].Add(callback);
  }
  public void RemoveEventListener(string eventType, Action<Connection, object> callback)
  {
    if (!EventListeners.ContainsKey(eventType))
      return;
    EventListeners[eventType].Remove(callback);
  }
  public void FireEvent(string eventType, object eventData = null)
  {
    if (!EventListeners.ContainsKey(eventType))
      return;
    foreach (var callback in EventListeners[eventType])
      callback(this, eventData);
  }
  public void SuspendReconnectUntil(Task suspendPromise) => SuspendReconnectPromise = suspendPromise;
  public void Suspend()
  {
    if (SuspendReconnectPromise == null)
      throw new Exception("Suspend promise not set");
    Socket?.Close();
  }
  public void Reconnect(bool force = false)
  {
    if (Socket == null)
      return;
    if (!force)
    {
      Socket.Close();
      return;
    }
    Socket.OnMessage -= HandleMessage;
    Socket.OnClose -= HandleClose;
    Socket.Close();
    HandleClose();
  }
  public void Close()
  {
    CloseRequested = true;
    Socket?.Close();
  }
  public async Task<UnsubscribeFunc> SubscribeEvents<TEvent>(Action<TEvent> callback, string eventType = null)
  {
    return await SubscribeMessage(callback, new SubscribeEventMessage { EventType = eventType });
  }
  public Task Ping() => SendMessagePromise(new PingMessage());
  public void SendMessage(MessageBase message, int? commandId = null)
  {
    if (!Connected)
      throw new Exception(Error.CONNECTION_LOST.ToString());
    if (QueuedMessages != null)
    {
      if (commandId.HasValue)
        throw new Exception("Cannot queue with commandId");
      QueuedMessages.Add(new TaskCompletionSource<object>());
      return;
    }
    if (!commandId.HasValue)
      commandId = GenCmdId();
    message.Id = commandId;
    Socket.Send(JsonSerializer.Serialize(message));
  }
  public Task<TResult> SendMessagePromise<TResult>(MessageBase message)
  {
    var tcs = new TaskCompletionSource<TResult>();
    if (QueuedMessages != null)
    {
      QueuedMessages.Add(new TaskCompletionSource<object>());
      return tcs.Task;
    }
    var commandId = GenCmdId();
    Commands[commandId] = new CommandWithAnswerInFlight { Resolve = tcs.SetResult, Reject = tcs.SetException };
    SendMessage(message, commandId);
    return tcs.Task;
  }
  public async Task<UnsubscribeFunc> SubscribeMessage<TResult>(Action<TResult> callback, MessageBase subscribeMessage, SubscribeOptions options = null)
  {
    if (QueuedMessages != null)
      await Task.WhenAny(QueuedMessages.Select(t => t.Task));
    var info = new SubscribeEventCommandInFlight<TResult> { Resolve = () => { }, Reject = ex => { }, Callback = callback, Subscribe = options?.Resubscribe != false ? () => SubscribeMessage(callback, subscribeMessage) : null, Unsubscribe = async () => { if (Connected) await SendMessagePromise(new UnsubscribeEventsMessage { Subscription = commandId }); Commands.Remove(commandId); } };
    Commands[commandId] = info;
    try
    { SendMessage(subscribeMessage, commandId); }
    catch { }
    return () => info.Unsubscribe();
  }
  private void HandleMessage(ResponseMessage msg)
  {
    var messageGroup = JsonSerializer.Deserialize<List<WebSocketResponse>>(msg.Binary);
    foreach (var message in messageGroup)
    {
      var info = Commands.GetValueOrDefault(message.Id);
      switch (message.Type)
      {
        case "event":
          if (info is SubscribeEventCommandInFlight subscribeInfo)
            subscribeInfo.Callback(message.Event);
          else
            SendMessagePromise(new UnsubscribeEventsMessage { Subscription = message.Id });
          break;
        case "result":
          if (info != null)
          {
            if (message.Success)
              info.Resolve(message.Result);
            else
              info.Reject(new Exception(message.Error.Message));
            if (!(info is SubscribeEventCommandInFlight))
              Commands.Remove(message.Id);
          }
          break;
        case "pong":
          if (info != null)
            info.Resolve(null);
          else
            Console.WriteLine($"Received unknown pong response {message.Id}");
          break;
        default:
          Console.WriteLine($"Unhandled message {message.Type}");
          break;
      }
    }
  }
  private async void HandleClose(object sender, CloseEventArgs e)
  {
    var oldCommands = Commands;
    CommandId = 1;
    OldSubscriptions = Commands;
    Commands = new Dictionary<int, CommandInFlight>();
    Socket = null;
    foreach (var info in oldCommands.Values)
    {
      if (!(info is SubscribeEventCommandInFlight))
        info.Reject(new Exception("Connection lost"));
    }
    if (CloseRequested)
      return;
    FireEvent("disconnected");
    var options = new ConnectionOptions { SetupRetry = 0, CreateSocket = Options.CreateSocket };
    var reconnect = new Action<int>(async tries =>
    {
      await Task.Delay(Math.Min(tries, 5) * 1000);
      if (CloseRequested)
        return;
      try
      {
        var socket = await options.CreateSocket(options);
        SetSocket(socket);
      }
      catch (Exception ex)
      {
        if (QueuedMessages != null)
        {
          var queuedMessages = QueuedMessages;
          QueuedMessages = null;
          foreach (var msg in queuedMessages)
            msg.SetException(new Exception("Connection lost"));
        }
        if (ex.Message == Error.INVALID_AUTH.ToString())
          FireEvent("reconnect-error", ex);
        else
          reconnect(tries + 1);
      }
    });
    if (SuspendReconnectPromise != null)
    {
      await SuspendReconnectPromise;
      SuspendReconnectPromise = null;
      QueuedMessages = new List<TaskCompletionSource<object>>();
    }
    reconnect(0);
  }
  private int GenCmdId() => ++CommandId;
}