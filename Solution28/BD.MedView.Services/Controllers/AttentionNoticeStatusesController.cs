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
    [RoutePrefix("api/AttentionNoticeStatuses")]
    public class AttentionNoticeStatusesController : ApiController
    {
        private const string defaultExpand = null;
        private const string defaultFilter = null;
        private readonly IAttentionNoticeStatusesService service;

        public AttentionNoticeStatusesController(IAttentionNoticeStatusesService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<AttentionNoticeStatus>))]
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

        public class SelectInputModel
        {
            public string Expand { get; set; } = null;
            public string Filter { get; set; } = null;
        }

        [HttpPost]
        [Route("List", Name = "AttentionNoticeStatuses_Select")]
        [ResponseType(typeof(AttentionNoticeStatus))]
        public IHttpActionResult Select([FromBody] SelectInputModel model)
        {
            try
            {
                var values = service.Select(model?.Expand ?? defaultExpand, model?.Filter ?? defaultFilter)
                    .ToList();
                return Ok(values);
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(HttpStatusCode.Forbidden);
            }
        }



        [HttpPost]
        [Route(Name = "AttentionNoticeStatuses_Create")]
        [ResponseType(typeof(AttentionNoticeStatus))]
        public IHttpActionResult Create(AttentionNoticeStatus value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Create(value);
                return CreatedAtRoute("AttentionNoticeStatuses_Create", new { id = value.Id }, value);
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
                ModelState.AddModelError(nameof(AttentionNoticeStatus.Key), nameof(DuplicateKeyException));
                return BadRequest(ModelState);
            }
        }

        [HttpGet]
        [Route("{id:int}")]
        [ResponseType(typeof(AttentionNoticeStatus))]
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
        [Route("{key}")]
        [ResponseType(typeof(AttentionNoticeStatus))]
        public IHttpActionResult Read(string key, [FromUri] string expand = null)
        {
            try
            {
                var value = service.Read(key, expand ?? defaultExpand);
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
        [Route("{id:int}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update(int id, AttentionNoticeStatus value)
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
                ModelState.AddModelError(nameof(AttentionNoticeStatus.Key), nameof(DuplicateKeyException));
                return BadRequest(ModelState);
            }
        }

        [HttpPut]
        [Route("{key}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Update(string key, AttentionNoticeStatus value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Update(key, value);
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
                ModelState.AddModelError(nameof(AttentionNoticeStatus.Key), nameof(DuplicateKeyException));
                return BadRequest(ModelState);
            }
        }

        [HttpDelete]
        [Route("{id:int}")]
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

        [HttpDelete]
        [Route("{key}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult Delete(string key)
        {
            try
            {
                service.Delete(key);
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