using System.Web.Http;
using System.Collections.Generic;
using BD.MedView.Services.Services;
using log4net;
using System.Web.Http.Description;
using System;
using System.Net;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/SilentProvisioning")]
    public class SilentProvisioningController : ApiController
    {
        private static readonly ILog logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        private readonly ISilentProvisioningService service;

        public SilentProvisioningController(ISilentProvisioningService service)
        {
            this.service = service;
        }

        [HttpPost]
        [Route("Provision", Name = "Provision")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Provision()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Provision(User);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }
    }
}