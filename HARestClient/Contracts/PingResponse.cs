namespace HARestClient.Contracts
{
  /// <summary>
  /// Response that is returned when the API is running.
  /// </summary>
  /// <param name="Message"></param>
  public record PingResponse(string Message)
  {
  }
}