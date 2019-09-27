using System.Linq;
using System.Net;
using System.Web.Http;
using System.Collections.Generic;
using BD.MedView.Services.Services;
using System;
using System.Web.Http.Description;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/Facilities")]
    public class FacilitiesController : ApiController
    {
        private const string defaultExpand = "Synonyms,Synonyms.Provider";
        private readonly IFacilitiesService service;

        public FacilitiesController(IFacilitiesService service)
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

        [HttpPost]
        [Route(Name = "Facilities_Create")]
        [ResponseType(typeof(Facility.Facility))]
        public IHttpActionResult Create(Facility.Facility value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Create(value);
                return CreatedAtRoute("Facilities_Create", new { id = value.Id }, value);
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
        [ResponseType(typeof(Facility.Facility))]
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
        public IHttpActionResult Update(int id, Facility.Facility value)
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