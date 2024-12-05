namespace HAWebSocketClient.Lib;

public class HassConfig
{
  public double Latitude { get; set; }
  public double Longitude { get; set; }
  public double Elevation { get; set; }
  public double Radius { get; set; }
  public UnitSystem? UnitSystem { get; set; }
  public string? LocationName { get; set; }
  public string? TimeZone { get; set; }
  public List<string>? Components { get; set; }
  public string? ConfigDir { get; set; }
  public List<string>? AllowlistExternalDirs { get; set; }
  public List<string> AllowlistExternalUrls { get; set; }
  public string? Version { get; set; }
  public string? ConfigSource { get; set; }
  public bool RecoveryMode { get; set; }
  public bool SafeMode { get; set; }
  public string? State { get; set; }
  public string? ExternalUrl { get; set; }
  public string? InternalUrl { get; set; }
  public string? Currency { get; set; }
  public string? Country { get; set; }
  public string? Language { get; set; }
}