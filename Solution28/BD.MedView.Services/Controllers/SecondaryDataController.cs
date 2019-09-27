using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web.Http;
using BD.MedView.Services.Extensions;
using BD.MedView.Services.Models;
using BD.MedView.Services.Services;
using Common.Logging;
using Newtonsoft.Json;

namespace BD.MedView.Services.Controllers
{
    [Authorize]
    [RoutePrefix("api/secondarydata")]
    public class SecondaryDataController : ApiController
    {
        private readonly ILog log;
        private readonly ISecondaryDataService service;

        public SecondaryDataController(ILog log, ISecondaryDataService service)
        {
            this.log = log ?? throw new ArgumentNullException(nameof(log));
            this.service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpPost]
        public IHttpActionResult Post([FromBody] SecondaryData model)
        {
            using (log.Activity(m => m($"Executing Post by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validating Input")))
                {
                    if (!ModelState.IsValid)
                    {
                        log.Trace(m => m("Validation failed"));
                        return BadRequest(ModelState);
                    }
                }

                using (log.Activity(m => m($"Executing Service Call")))
                {
                    try
                    {
                        service.Process(model);
                    }
                    catch (UnauthorizedAccessException e)
                    {
                        log.Warn(m => m("Authorization failed", e));
                        return StatusCode(HttpStatusCode.Forbidden);
                    }
                    catch (Exception e)
                    {
                        log.Error(m => m("Process failed", e));
                        return InternalServerError(e);
                    }
                }

                var value = null as object;
                using (log.Activity(m => m($"Formatting Result")))
                {
                    try
                    {
                        value = new
                        {
                            PageInfoList = new
                            {
                                PageInfo = model.PageInfoList.PageInfo
                                    //Filter elements without alerts 
                                    .Where(item => item.MedMinedAlert != null)
                                    .Select(item => new {
                                        item.Id,
                                        item.MedMinedAlert
                                    }).ToArray()
                            }
                        };
                    }
                    catch (Exception e)
                    {
                        log.Error(m => m("Formatting failed", e));
                        return InternalServerError(e);
                    }
                }

                log.Info(m => m($"Executing Post by {Thread.CurrentPrincipal?.Identity?.Name} succeeded"));

                return Ok(value);
            }
        }
    }
}
