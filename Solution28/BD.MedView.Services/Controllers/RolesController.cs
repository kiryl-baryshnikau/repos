using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using System;
using BD.MedView.Authorization;
using System.Collections.Generic;
using BD.MedView.Services.Services;

namespace BD.MedView.Services.Controllers
{
    //TODO: KB: All emittable operations shoud cause corresponding configuration actions
    [Authorize]
    [RoutePrefix("api/Roles")]
    public class RolesController : ApiController
    {
        private const string defaultExpand = "Principals,Principals.Claims,Realm";
        private readonly IRolesService service;

        public RolesController(IRolesService service)
        {
            this.service = service;
        }

        [HttpGet]
        [Route]
        [ResponseType(typeof(IEnumerable<Role>))]
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
        [Route(Name = "Roles_Create")]
        [ResponseType(typeof(Role))]
        public IHttpActionResult Create([FromBody]Role value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Create(value);
                return CreatedAtRoute("Roles_Create", new { id = value.Id }, value);
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
        [ResponseType(typeof(Role))]
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
        public IHttpActionResult Update(int id, [FromBody]Role value)
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
        }

        [HttpPost]
        [HttpPut]
        [Route("{id}/Roles/{link}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult AddRole(int id, int link)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                service.AddPrincipal(id, link);
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
        [Route("{id}/Roles/{link}")]
        [ResponseType(typeof(void))]
        public IHttpActionResult RemoveRole(int id, int link)
        {
            try
            {
                service.RemovePrincipal(id, link);
                //TODO: KB: Emit Something
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