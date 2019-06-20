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
    public class InfusionPreferencesController : ApiController
    {
        private Context db = new Context();

        // GET: api/InfusionPreferences
        public IQueryable<InfusionPreference> GetInfusionPreferences()
        {
            return db.InfusionPreferences;
        }

        // GET: api/InfusionPreferences/5
        [ResponseType(typeof(InfusionPreference))]
        public IHttpActionResult GetInfusionPreference(int id)
        {
            InfusionPreference infusionPreference = db.InfusionPreferences.Find(id);
            if (infusionPreference == null)
            {
                return NotFound();
            }

            return Ok(infusionPreference);
        }

        // PUT: api/InfusionPreferences/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutInfusionPreference(int id, InfusionPreference infusionPreference)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != infusionPreference.Id)
            {
                return BadRequest();
            }

            db.Entry(infusionPreference).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InfusionPreferenceExists(id))
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

        // POST: api/InfusionPreferences
        [ResponseType(typeof(InfusionPreference))]
        public IHttpActionResult PostInfusionPreference(InfusionPreference infusionPreference)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.InfusionPreferences.Add(infusionPreference);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = infusionPreference.Id }, infusionPreference);
        }

        // DELETE: api/InfusionPreferences/5
        [ResponseType(typeof(InfusionPreference))]
        public IHttpActionResult DeleteInfusionPreference(int id)
        {
            InfusionPreference infusionPreference = db.InfusionPreferences.Find(id);
            if (infusionPreference == null)
            {
                return NotFound();
            }

            db.InfusionPreferences.Remove(infusionPreference);
            db.SaveChanges();

            return Ok(infusionPreference);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool InfusionPreferenceExists(int id)
        {
            return db.InfusionPreferences.Count(e => e.Id == id) > 0;
        }
    }
}