using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using BD.MedView.Configuration;
using BD.MedView.Services.Services;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/globalpreferences")]
    public class GlobalPreferencesController : ApiController
    {
        private const string defaultExpand = null;
        private readonly IGlobalPreferencesService service;

        public GlobalPreferencesController(IGlobalPreferencesService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<GlobalPreference>))]
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

        [HttpGet]
        [Route("{id:int}")]
        [ResponseType(typeof(GlobalPreference))]
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

        [HttpGet]
        [Route("Infusion")]
        [ResponseType(typeof(InfusionGlobalPreference))]
        public IHttpActionResult GetInfusionPreference([FromUri] string expand = null)
        {
            try
            {
                var value = service.InfusionPreference;
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
        [Route("Infusion")]
        [ResponseType(typeof(void))]
        public IHttpActionResult SetInfusionPreference([FromBody]InfusionGlobalPreference value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.InfusionPreference = value;
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
                ModelState.AddModelError(nameof(InfusionGlobalPreference.Name), nameof(DuplicateKeyException));
                return BadRequest(ModelState);
            }
        }

        public class DefaultArgs
        {
            public string Name { get; set; }
        }
        [HttpPost]
        [Route("Default")]
        [ResponseType(typeof(GlobalPreference))]
        public IHttpActionResult Default([FromBody]DefaultArgs args)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var value = service.Default(args.Name);
                return Ok(value);
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
                ModelState.AddModelError(nameof(InfusionGlobalPreference.Name), nameof(DuplicateKeyException));
                return BadRequest(ModelState);
            }
        }
    }
}