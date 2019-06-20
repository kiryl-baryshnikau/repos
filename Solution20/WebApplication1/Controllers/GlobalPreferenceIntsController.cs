using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class GlobalPreferenceIntsController : ApiController
    {
        private Context db = new Context();

        // GET: api/GlobalPreferenceInts
        //public IQueryable<GlobalPreferenceInt> GetGlobalPreferenceInts()
        //{
        //    return db.GlobalPreferenceInts;
        //}
        public IQueryable<GlobalPreferenceInt> GetGlobalPreferenceInts()
        {
            return db.GlobalPreferenceInts;
        }


        // GET: api/GlobalPreferenceInts/5
        [ResponseType(typeof(GlobalPreferenceInt))]
        public IHttpActionResult GetGlobalPreferenceInt(int id)
        {
            GlobalPreferenceInt globalPreferenceInt = db.GlobalPreferenceInts.Find(id);
            if (globalPreferenceInt == null)
            {
                return NotFound();
            }

            return Ok(globalPreferenceInt);
        }

        // PUT: api/GlobalPreferenceInts/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutGlobalPreferenceInt(int id, GlobalPreferenceInt globalPreferenceInt)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != globalPreferenceInt.Id)
            {
                return BadRequest();
            }

            db.Entry(globalPreferenceInt).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GlobalPreferenceIntExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/GlobalPreferenceInts
        [ResponseType(typeof(GlobalPreferenceInt))]
        public IHttpActionResult PostGlobalPreferenceInt(GlobalPreferenceInt globalPreferenceInt)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.GlobalPreferenceInts.Add(globalPreferenceInt);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = globalPreferenceInt.Id }, globalPreferenceInt);
        }

        // DELETE: api/GlobalPreferenceInts/5
        [ResponseType(typeof(GlobalPreferenceInt))]
        public IHttpActionResult DeleteGlobalPreferenceInt(int id)
        {
            GlobalPreferenceInt globalPreferenceInt = db.GlobalPreferenceInts.Find(id);
            if (globalPreferenceInt == null)
            {
                return NotFound();
            }

            db.GlobalPreferenceInts.Remove(globalPreferenceInt);
            db.SaveChanges();

            return Ok(globalPreferenceInt);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GlobalPreferenceIntExists(int id)
        {
            return db.GlobalPreferenceInts.Count(e => e.Id == id) > 0;
        }
    }
}