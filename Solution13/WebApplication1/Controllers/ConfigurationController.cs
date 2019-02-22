using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    public class ConfigurationController
    {
        [HttpGet()]
        public Configuration Get()
        {
            return new Configuration
            {
                authorizationUrl = "api/authorization",
            };
        }
        public class Configuration
        {
            public string authorizationUrl { get; set; }
        }
    }
}
