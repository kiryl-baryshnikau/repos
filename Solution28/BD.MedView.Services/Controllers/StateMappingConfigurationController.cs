using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using BD.MedView.Configuration;
using BD.MedView.Services.Services;

namespace BD.MedView.Services.Controllers
{
    [RoutePrefix("api/StateMappingConfiguration")]
    public class StateMappingConfigurationController : ApiController
    {
        private readonly IStateMappingsConfigurationService _configurationService;

        public StateMappingConfigurationController(
            IStateMappingsConfigurationService configurationService)
        {
            _configurationService = configurationService;
        }
        
        [Route]
        [HttpGet]
        [ResponseType(typeof(IEnumerable<WidgetState>))]
        public IHttpActionResult Get()
        {
            try
            {
                var widgetStates = _configurationService.GetMappings();
                return Ok(widgetStates); 
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
