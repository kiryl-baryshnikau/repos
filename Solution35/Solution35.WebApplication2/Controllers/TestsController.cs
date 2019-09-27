using System.Web.Http;

namespace Solution35.WebApplication2.Controllers
{
    public class TestsController : ApiController
    {
        public IHttpActionResult Get()
        {
            return Ok(new[] { "string1", "string2" });
        }
    }
}
