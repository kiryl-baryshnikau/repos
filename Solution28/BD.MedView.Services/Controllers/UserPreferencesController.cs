using System;
using System.Web.Http;
using BD.MedView.Configuration;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using System.Web.Http.Description;
using System.Data.Linq;
using BD.MedView.Services.Services;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/UserPreferences")]
    public class UserPreferencesController : ApiController
    {
        private const string defaultExpand = "";
        private readonly IUserPreferencesService service;

        public UserPreferencesController(IUserPreferencesService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<UserPreference>))]
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

        [HttpPost]
        [Route(Name = "UserPreferences_Create")]
        [ResponseType(typeof(UserPreference))]
        public IHttpActionResult Create([FromBody]UserPreference value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Create(value);
                return CreatedAtRoute("UserPreferences_Create", new { id = value.Id }, value);
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

        [HttpGet]
        [Route("{id}")]
        [ResponseType(typeof(UserPreference))]
        public IHttpActionResult Read(int id, [FromUri] string expand = null)
        {
            try
            {
                var value = service.Read(id, expand ?? defaultExpand);
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

        [HttpPut]
        [Route("{id}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update(int id, [FromBody]UserPreference value)
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
            catch (Exception e)
            {
                return InternalServerError(e);
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
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }

        [HttpPost]
        [Route("Migrate")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Migrate([FromBody] MigrateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                service.Migrate(request);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(HttpStatusCode.NoContent);
            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }
    }
}