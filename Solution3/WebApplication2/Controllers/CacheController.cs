using System.Collections.Generic;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;

namespace WebApplication2.Controllers
{
    [RoutePrefix("api/Cache")]
    public class CacheController : ApiController
    {
        private static Dictionary<string, string> items = new Dictionary<string, string>() { { "a", "10" } };


        [HttpGet]
        [Route("{key}")]
        [ResponseType(typeof(string))]
        public IHttpActionResult Read(string key)
        {
            var value = null as string;
            if (items.TryGetValue(key, out value))
            {
                return Ok(value);
            }
            else
            {
                return Ok((string)null);
            }
        }

        [HttpPut]
        [Route("{key}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update(string key, [FromBody]string value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            items[key] = value;
            return StatusCode(HttpStatusCode.NoContent);
        }
    }
}