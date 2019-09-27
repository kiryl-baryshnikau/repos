using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using BD.MedView.Configuration;
using BD.MedView.Services.Services;

namespace BD.MedView.Services.Controllers
{
    [RoutePrefix("api/ProviderStates")]
    public class ProviderStatesController : ApiController
    {
        private readonly IStateMappingsConfigurationService stateMappingsConfiguration;


        public ProviderStatesController(IStateMappingsConfigurationService stateMappingsConfiguration)
        {
            this.stateMappingsConfiguration = stateMappingsConfiguration;
        }

        [HttpPost]
        [Route]
        [ResponseType(typeof(void))]
        public IHttpActionResult Post([FromBody] List<ProviderState> statesRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                stateMappingsConfiguration.Create(statesRequest);
                return Ok();

            }
            catch (KeyNotFoundException)
            {
                return StatusCode(HttpStatusCode.NotFound);
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
        [Route]
        [ResponseType(typeof(IEnumerable<ProviderState>))]
        public IHttpActionResult Get()
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                return Ok(stateMappingsConfiguration.GetProviderStates());

            }
            catch (KeyNotFoundException)
            {
                return StatusCode(HttpStatusCode.NotFound);
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

        [Route]
        [HttpPut]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update([FromBody] IEnumerable<ProviderState> states)
        {
            try
            {
                stateMappingsConfiguration.Update(states.ToList());
                return Ok(HttpStatusCode.NoContent);
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
        [Route("Ensure")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Ensure()
        {
            try
            {
                stateMappingsConfiguration.Ensure();
                return Ok();
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(HttpStatusCode.NotFound);
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

        [HttpPut]
        [Route("Synch")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Synch([FromBody] List<ProviderState> states)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                stateMappingsConfiguration.Synch(states);
                return StatusCode(HttpStatusCode.NoContent);
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(HttpStatusCode.NotFound);
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
        [Route("SynchDeleted")]
        [ResponseType(typeof(void))]
        public IHttpActionResult SynchDeleted([FromBody] List<ProviderState> states)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                stateMappingsConfiguration.SynchDeletedStates(states);
                return StatusCode(HttpStatusCode.NoContent);
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(HttpStatusCode.NotFound);
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




    }
}
