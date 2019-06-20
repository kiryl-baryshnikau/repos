using BD.MedView.Configuration;
using BD.MedView.Services.Binders;
using BD.MedView.Services.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.ModelBinding;

namespace BD.MedView.Services.Controllers
{
    [RoutePrefix("api/globalpreferences")]
    public class GlobalPreferencesController : ApiController
    {
        private readonly IGlobalPreferencesService service;

        public GlobalPreferencesController() {
            this.service = new GlobalPreferencesService();
        }


        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<GlobalPreferences>))]
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

        //[HttpPost]
        //[Route(Name = "Providers_Create")]
        //[ResponseType(typeof(GlobalPreferences))]
        ////public IHttpActionResult Create([ModelBinder(typeof(GlobalPreferencesModelBinder))]GlobalPreferences value)
        ////public IHttpActionResult Create(GlobalPreferences value)
        //public IHttpActionResult Create(GlobalPreferences value)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    try
        //    {
        //        service.Create(value);
        //        return CreatedAtRoute("Providers_Create", new { id = value.Id }, value);
        //    }
        //    catch (NotSupportedException)
        //    {
        //        return BadRequest();
        //    }
        //    catch (UnauthorizedAccessException)
        //    {
        //        return StatusCode(HttpStatusCode.Forbidden);
        //    }
        //    catch (KeyNotFoundException)
        //    {
        //        return NotFound();
        //    }
        //}

        [HttpPost]
        [Route(Name = "Providers_Create1")]
        [ResponseType(typeof(GlobalPreferences))]
        //public IHttpActionResult Create([ModelBinder(typeof(GlobalPreferencesModelBinder))]InfusionPreference value)
        public IHttpActionResult Create(InfusionPreference value)
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

        [HttpPost]
        [Route(Name = "Providers_Create2")]
        [ResponseType(typeof(GlobalPreferences))]
        public IHttpActionResult Create([ModelBinder(typeof(GlobalPreferencesModelBinder))]DispensingPreference value)
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
        [ResponseType(typeof(GlobalPreferences))]
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
        public IHttpActionResult Update(int id, GlobalPreferences value)
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
