using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Http.OData;
using System.Web.Http.OData.Routing;
using WebApplication2.Models;

namespace WebApplication2.Controllers
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using WebApplication2.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<EntityA>("EntityAs");
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class EntityAsController : ODataController
    {
        private Context db = new Context();

        // GET: odata/EntityAs
        [EnableQuery]
        public IQueryable<EntityA> GetEntityAs()
        {
            return db.EntityAs;
        }

        // GET: odata/EntityAs(5)
        [EnableQuery]
        public SingleResult<EntityA> GetEntityA([FromODataUri] int key)
        {
            return SingleResult.Create(db.EntityAs.Where(entityA => entityA.Id == key));
        }

        // PUT: odata/EntityAs(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<EntityA> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            EntityA entityA = db.EntityAs.Find(key);
            if (entityA == null)
            {
                return NotFound();
            }

            patch.Put(entityA);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EntityAExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(entityA);
        }

        // POST: odata/EntityAs
        public IHttpActionResult Post(EntityA entityA)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.EntityAs.Add(entityA);
            db.SaveChanges();

            return Created(entityA);
        }

        // PATCH: odata/EntityAs(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<EntityA> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            EntityA entityA = db.EntityAs.Find(key);
            if (entityA == null)
            {
                return NotFound();
            }

            patch.Patch(entityA);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EntityAExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(entityA);
        }

        // DELETE: odata/EntityAs(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            EntityA entityA = db.EntityAs.Find(key);
            if (entityA == null)
            {
                return NotFound();
            }

            db.EntityAs.Remove(entityA);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool EntityAExists(int key)
        {
            return db.EntityAs.Count(e => e.Id == key) > 0;
        }
    }
}
