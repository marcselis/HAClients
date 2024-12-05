namespace HAWebSocketClient.Lib;

public enum Error
{
  CANNOT_CONNECT = 1,
  INVALID_AUTH = 2,
  CONNECTION_LOST = 3,
  HASS_HOST_REQUIRED = 4,
  INVALID_HTTPS_TO_HTTP = 5,
  INVALID_AUTH_CALLBACK = 6
}