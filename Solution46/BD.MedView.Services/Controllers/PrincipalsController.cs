using System;
using System.Collections.Generic;
using System.Linq;
using BD.MedView.Authorization;
using BD.MedView.Services.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

// To protect from overposting attacks, please enable the specific properties you want to bind to, for
// more details see https://aka.ms/RazorPagesCRUD.
namespace BD.MedView.Services.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrincipalsController : ControllerBase
    {
        private const string defaultExpand = "Claims,Roles,Roles.Realm";
        private readonly IPrincipalsService service;

        public PrincipalsController(IPrincipalsService service)
        {
            this.service = service;
        }

        // GET: api/Principals
        [HttpGet]
        public ActionResult List([FromQuery] string expand = defaultExpand)
        {
            try
            {
                var values = service.Select(expand).ToList();
                return Ok(values);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception e)
            {
                //return StatusCode(StatusCodes.Status500InternalServerError, e);
                //return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                //throw e;
                return this.InternalServerError(e);
            }
        }

        // POST: api/Principals
        [HttpPost]
        public ActionResult<Principal> Create([FromBody] Principal value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Create(value);
                return CreatedAtRoute(nameof(Read), new { id = value.Id }, value);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // GET: api/Principals/5
        [HttpGet("{id}")]
        public ActionResult<Principal> Read(int id, [FromQuery] string expand = defaultExpand)
        {
            try
            {
                var value = service.Read(id, expand);
                return Ok(value);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }
        }

        // PUT: api/Principals/5
        [HttpPut("{id}")]
        public ActionResult Update(int id, Principal value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                service.Update(id, value);
                return NoContent();
            }
            catch (NotSupportedException)
            {
                return BadRequest();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }
        }

        // DELETE: api/Principals/5
        [HttpDelete("{id}")]
        public ActionResult<Principal> Delete(int id)
        {
            try
            {
                var value = service.Delete(id);
                return Ok(value);
            }
            catch (NotSupportedException)
            {
                return BadRequest();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }
        }
    }
}
