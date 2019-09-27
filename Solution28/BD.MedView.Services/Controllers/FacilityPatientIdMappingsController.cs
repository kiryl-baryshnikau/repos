using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using System;
using System.Collections.Generic;
using BD.MedView.Configuration;
using BD.MedView.Services.Services;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/FacilityPatientIdMappings")]
    public class FacilityPatientIdMappingsController : ApiController
    {
        private const string defaultExpand = "";
        private readonly IFacilityPatientIdMappingsService service;

        public FacilityPatientIdMappingsController(IFacilityPatientIdMappingsService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<FacilityPatientIdMapping>))]
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
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }

        [HttpGet]
        [Route("{id}")]
        [ResponseType(typeof(FacilityPatientIdMapping))]
        public IHttpActionResult Read(int id)
        {
            try
            {
                var value = service.Read(id);
                return Ok(value);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
        }
    }
}