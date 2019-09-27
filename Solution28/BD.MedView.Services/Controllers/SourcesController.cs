using BD.MedView.Services.Models;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Description;
using BD.MedView.Services.Extensions;
using BD.MedView.Services.Services;
using System;
using System.Net;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/Sources")]
    public class SourcesController : ApiController
    {
        private readonly ISourcesService service;

        public SourcesController(
            ISourcesService service
            )
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<Source>))]
        public IHttpActionResult Select()
        {
            try
            {
                var values = service.Select()
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
        [ResponseType(typeof(Source))]
        public IHttpActionResult Read(int id)
        {
            try
            {
                var value = service.Read(id);
                return Ok(value);
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
