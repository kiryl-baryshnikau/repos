using BD.MedView.Facility;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using BD.MedView.Services.Services;
using System;
using System.Collections.Generic;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/Providers")]
    public class ProvidersController : ApiController
    {
        private readonly IProvidersService service;

        public ProvidersController(IProvidersService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<Provider>))]
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
        }

        [HttpPost]
        [Route(Name = "Providers_Create")]
        [ResponseType(typeof(Provider))]
        public IHttpActionResult Create(Provider value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Create(value);
                return CreatedAtRoute("Providers_Create", new { id = value.Id }, value);
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

        [HttpGet]
        [Route("{id}")]
        [ResponseType(typeof(Provider))]
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

        [HttpPut]
        [Route("{id}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update(int id, Provider value)
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