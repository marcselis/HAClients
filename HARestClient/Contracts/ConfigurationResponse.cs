using System.Text.Json.Serialization;

namespace HARestClient.Contracts
{
  public record ConfigurationResponse(
    decimal Latitude,
    decimal Longitude,
    ushort Elevation,
    [property: JsonPropertyName("unit_system")]
    UnitSystem UnitSystem,
    [property: JsonPropertyName("location_name")]
    string LocationName,
    [property: JsonPropertyName("time_zone")]
    string TimeZone,
    string[] Components,
    [property: JsonPropertyName("config_dir")]
    string ConfigDir,
    [property: JsonPropertyName("whitelist_external_dirs")]
    string[] WhitelistExternalDirs,
    [property: JsonPropertyName("allowlist_external_dirs")]
    string[] AllowlistExternalDirs,
    [property: JsonPropertyName("allowlist_external_urls")]
    string[] AllowlistExternalUrls,
    string Version,
    [property: JsonPropertyName("config_source")]
    string ConfigSource,
    [property: JsonPropertyName("recovery_mode")]
    bool RecoveryMode,
    string State,
    [property: JsonPropertyName("external_url")]
    string ExternalUrl,
    [property: JsonPropertyName("internal_url")]
    string? InternalUrl,
    string Currency,
    string Country,
    string Language,
    [property: JsonPropertyName("safe_mode")]
    bool SafeMode,
    bool Debug,
    ushort Radius)
  {
  }

  public record UnitSystem(
    string Length,
    [property: JsonPropertyName("accumulated_precipitation")]
    string AccumultedPrecipitation,
    string Mass,
    string Pressure,
    string Temperature,
    string Volume,
    [property: JsonPropertyName("wind_speed")]
    string WindSpeed)
  {
  }
}
