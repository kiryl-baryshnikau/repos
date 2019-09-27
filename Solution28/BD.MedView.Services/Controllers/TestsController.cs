using System.Linq;
using System.Net;
using System.Web.Http;
using System.Collections.Generic;
using BD.MedView.Services.Services;
using System;
using System.Web.Http.Description;
using BD.MedView.Authorization;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/tests")]
    public class TestsController : ApiController
    {
        private const string defaultExpand = "Synonyms,Synonyms.Provider";
        private readonly ITestsService service;

        public TestsController(ITestsService service)
        //public TestsController()
        {
            this.service = service;
        }

        [AllowAnonymous]
        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<Facility.Facility>))]
        public IHttpActionResult Select([FromUri] string expand = null)
        {
            try
            {
                var values = service.Select(expand ?? defaultExpand)
                    .ToList();
                return Ok(values);
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
        }
    }
}