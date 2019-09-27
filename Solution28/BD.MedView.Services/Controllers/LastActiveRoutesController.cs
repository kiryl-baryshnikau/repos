using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using BD.MedView.Services.Services;
using System.Web.Http.Description;
using BD.MedView.Runtime;
using System.Data.Linq;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/LastActiveRoutes")]
    public class LastActiveRoutesController : ApiController
    {
        private const string defaultExpand = null;
        private const string defaultFilter = null;
        private readonly ILastActiveRoutesService service;

        public LastActiveRoutesController(ILastActiveRoutesService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<LastActiveRoute>))]
        public IHttpActionResult Select([FromUri] string expand = null, [FromUri] string filter = null)
        {
            try
            {
                var values = service.Select(expand ?? defaultExpand, filter ?? defaultFilter)
                    .ToList();
                return Ok(values);
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
        }

        [HttpPost]
        [Route(Name = "LastActiveRoutes_Create")]
        [ResponseType(typeof(LastActiveRoute))]
        public IHttpActionResult Create(LastActiveRoute value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Create(value);
                return CreatedAtRoute("LastActiveRoutes_Create", new { id = value.Id }, value);
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
            catch (DuplicateKeyException)
            {
                ModelState.AddModelError(nameof(LastActiveRoute.User), nameof(DuplicateKeyException));
                return BadRequest(ModelState);
            }
        }

        [HttpGet]
        [Route("{id}")]
        [ResponseType(typeof(LastActiveRoute))]
        public IHttpActionResult Read(int id, [FromUri] string expand = null)
        {
            try
            {
                var value = service.Read(id, expand ?? defaultExpand);
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

        [HttpPut]
        [Route("{id}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update(int id, LastActiveRoute value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Update(id, value);
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
            catch (DuplicateKeyException)
            {
                ModelState.AddModelError(nameof(LastActiveRoute.User), nameof(DuplicateKeyException));
                return BadRequest(ModelState);
            }
        }

        [HttpDelete]
        [Route("{id}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                service.Delete(id);
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