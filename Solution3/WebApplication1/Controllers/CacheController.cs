using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    public class CacheController : Controller
    {
        private static Dictionary<string, string> items = new Dictionary<string, string>() { { "a", "10" } };

        [HttpGet("{key}")]
        public string Get(string key)
        {
            var value = null as string;
            if (items.TryGetValue(key, out value))
            {
                return value;
            }
            else
            {
                return null;
            }
        }

        //[HttpPut("{key}")]
        //public void Put([FromRoute] string key, [FromBody] string value)
        //{
        //    items[key] = value;
        //}

        [HttpPut("{key}")]
        public void Put([FromRoute] string key)
        {
            var value = null as string;
            using (var reader = new StreamReader(Request.Body))
            {
                value = reader.ReadToEnd();
            }
            items[key] = value;
        }
    }
}
