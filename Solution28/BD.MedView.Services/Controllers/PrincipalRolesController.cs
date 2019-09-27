using BD.MedView.Services.Services;
using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;

namespace BD.MedView.Services.Controllers
{
    [Obsolete("Use PrincipalsController")]
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    [Authorize]
    [RoutePrefix("api/PrincipalRoles")]
    public class PrincipalRolesController : ApiController
    {
        private readonly IPrincipalsService service;

        public PrincipalRolesController(IPrincipalsService service)
        {
            this.service = service;
        }

        [HttpPost]
        [Route("add/{id}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult PostPrincipalRole([FromUri]int id, [FromBody]int link)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                service.AddRole(id, link);
                return StatusCode(HttpStatusCode.NoContent);
            }
            catch (NotSupportedException)
            {
                return BadRequest();
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        [Route("remove/{id}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult PostToDeletePrincipalRole([FromUri]int id, [FromBody]int link)
        {
            try
            {
                service.RemoveRole(id, link);
                //TODO: KB: Emit Something
                return StatusCode(HttpStatusCode.NoContent);
            }
            catch (NotSupportedException)
            {
                return BadRequest();
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
