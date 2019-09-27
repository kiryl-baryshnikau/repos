using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using BD.MedView.Services.Services;
using System;
using System.Collections.Generic;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/Cache")]
    public class CacheController : ApiController
    {
        private readonly ICacheService service;

        public CacheController(ICacheService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route("{key}")]
        [ResponseType(typeof(string))]
        public IHttpActionResult Read(string key)
        {
            try
            {
                var value = service.Get(key);

                //Should we return NotFound or NoContent. Must be noContent because it is equal to null. But null in distributed cache means here no key found....
                if (value == null)
                {
                    return StatusCode(HttpStatusCode.NoContent);
                    //return NotFound();
                }

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
        [Route("{key}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update(string key, [FromBody]string value, [FromUri] CacheServiceOptions options)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Set(key, value, options);
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
        [Route("{key}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Delete(string key)
        {
            try
            {
                service.Remove(key);
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

        //TODO: KB: Find verb that Redis used for refresh
        [HttpOptions]
        [Route("{key}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Refresh(string key)
        {
            try
            {
                service.Refresh(key);
                return StatusCode(HttpStatusCode.NoContent);
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