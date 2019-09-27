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
    [RoutePrefix("api/Accesses")]
    public class AccessesController : ApiController
    {
        private const string defaultExpand = "";
        private readonly IAccessesService service;

        public AccessesController(IAccessesService service)
        {
            this.service = service;
        }

        [AllowAnonymous]
        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<Access>))]
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