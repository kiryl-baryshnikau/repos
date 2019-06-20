using Microsoft.AspNetCore.Mvc;
using System;

namespace WebApplication2.Controllers
{
    [Route("api/[controller]")]
    public class AuthorizationController
    {
        [HttpGet()]
        public Authorization Get()
        {
            return new Authorization {
                name = "Test",
                authorized = true,
                roles = new [] { "hello", "world" },
                revision = DateTime.Now
            };
        }

        public class Authorization
        {
            public string name { get; set; }
            public bool authorized { get; set; }
            public string[] roles { get; set; }
            public DateTime revision { get; set; }
        }
    }
}
