using System.Text.Json;

namespace HAWebSocketClient.Lib;

public class Store<TState>
{
  private List<Action<TState>> _listeners = new List<Action<TState>>();
  public TState State { get; private set; }
  public Action<TState> Action(Func<TState, object[], Task<Partial<TState>>> action) => async args =>
  {
    var result = await action(State, args);
    SetState(result, false);
  };
  public void SetState(Partial<TState> update, bool overwrite = false)
  {
    State = overwrite ? update : Merge(State, update);
    foreach (var listener in _listeners) listener(State);
  }
  public void ClearState() => State = default;
  public UnsubscribeFunc Subscribe(Action<TState> listener)
  {
    _listeners.Add(listener);
    return () => _listeners.Remove(listener);
  }
  private TState Merge(TState state, Partial<TState> update)
  {
    var json = JsonSerializer.Serialize(state);
    var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
    foreach (var prop in update.GetType().GetProperties())
    {
      dict[prop.Name] = prop.GetValue(update);
    }
    return JsonSerializer.Deserialize<TState>(JsonSerializer.Serialize(dict));
  }
}