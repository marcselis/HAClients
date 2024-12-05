namespace HAWebSocketClient.Lib;

public class StateChangedEvent : HassEventBase
{
    public string EventType { get; set; } = "state_changed";
    public StateChangedData Data { get; set; }
}