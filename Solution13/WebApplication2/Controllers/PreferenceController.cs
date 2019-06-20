using Microsoft.AspNetCore.Mvc;
using System;

namespace WebApplication2.Controllers
{
    [Route("api/[controller]")]
    public class PreferenceController
    {
        [HttpGet()]
        public Preference Get()
        {
            return new Preference
            {
                prefA = "Test",
                prefB = 1,
                revision = DateTime.Now
            };
        }

        public class Preference
        {
            public string prefA { get; set; }
            public int prefB { get; set; }
            public DateTime revision { get; set; }
        }
    }
}
