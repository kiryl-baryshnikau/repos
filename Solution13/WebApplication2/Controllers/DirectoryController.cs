using Microsoft.AspNetCore.Mvc;
using System;

namespace WebApplication2.Controllers
{
    [Route("api/[controller]")]
    public class DirectoryController
    {
        [HttpGet()]
        public Directory Get()
        {
            return new Directory
            {
                dirA = "Test",
                dirB = 1,
                revision = DateTime.Now
            };
        }

        public class Directory
        {
            public string dirA { get; set; }
            public int dirB { get; set; }
            public DateTime revision { get; set; }
        }
    }
}
