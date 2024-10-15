using System.Text.Json.Serialization;

namespace HAWebSocketClient.Contracts;

[JsonDerivedType(typeof(SubscribeToStateChanged))]
public class SubscribeToEvents : Command
{
  public SubscribeToEvents() : base("subscribe_events")
  { }

  public SubscribeToEvents(string eventTypeFilter) : this()
  {
    EventTypeFilter=eventTypeFilter;
  }

  [JsonPropertyName("event_type")]
  public string EventTypeFilter { get; set; }
}