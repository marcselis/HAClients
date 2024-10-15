using Microsoft.Extensions.Configuration;

namespace HARestClient
{
  internal class Settings
  {
    public Settings(IConfiguration configuration)
    {
      configuration.Bind(this);
    }

    public string AuthorizationToken { get; set; }

    public string HomeAssistantUri { get; set; }
  }
}
