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
    public class GlobalPreferencesController : ApiController
    {
        private Context db = new Context();

        // GET: api/GlobalPreferences
        //public IQueryable<GlobalPreference> GetGlobalPreferences()
        //{
        //    return db.GlobalPreferences;
        //}
        [ResponseType(typeof(List<GlobalPreference>))]
        public IHttpActionResult GetGlobalPreferences()
        {
            return Ok(db.GlobalPreferences.ToList());
        }

        // GET: api/GlobalPreferences/5
        [ResponseType(typeof(GlobalPreference))]
        public IHttpActionResult GetGlobalPreference(int id)
        {
            GlobalPreference globalPreference = db.GlobalPreferences.Find(id);
            if (globalPreference == null)
            {
                return NotFound();
            }

            return Ok(globalPreference);
        }

        // DELETE: api/GlobalPreferences/5
        [ResponseType(typeof(GlobalPreference))]
        public IHttpActionResult DeleteGlobalPreference(int id)
        {
            GlobalPreference globalPreference = db.GlobalPreferences.Find(id);
            if (globalPreference == null)
            {
                return NotFound();
            }

            db.GlobalPreferences.Remove(globalPreference);
            db.SaveChanges();

            return Ok(globalPreference);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GlobalPreferenceExists(int id)
        {
            return db.GlobalPreferences.Count(e => e.Id == id) > 0;
        }
    }
}