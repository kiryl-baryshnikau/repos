using Microsoft.AspNetCore.Mvc;
using System;

namespace WebApplication2.Controllers
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
                directoryUrl = "api/directory",
                preferenceUrl = "api/preference",
                revision = DateTime.Now
            };
        }
        public class Configuration
        {
            public string authorizationUrl { get; set; }
            public string directoryUrl { get; set; }
            public string preferenceUrl { get; set; }
            public DateTime revision { get; set; }
        }
    }
}
