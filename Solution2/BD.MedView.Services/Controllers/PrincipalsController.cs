using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using BD.MedView.Services.Models;

namespace BD.MedView.Services.Controllers
{
    public class PrincipalsController : ApiController
    {
        private Context db = new Context();

        // GET: api/Principals
        public IQueryable<Principal> GetPrincipals()
        {
            return db.Principals;
        }

        // GET: api/Principals/5
        [ResponseType(typeof(Principal))]
        public IHttpActionResult GetPrincipal(int id)
        {
            Principal principal = db.Principals.Find(id);
            if (principal == null)
            {
                return NotFound();
            }

            return Ok(principal);
        }

        // PUT: api/Principals/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutPrincipal(int id, Principal principal)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != principal.Id)
            {
                return BadRequest();
            }

            db.Entry(principal).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PrincipalExists(id))
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

        // POST: api/Principals
        [ResponseType(typeof(Principal))]
        public IHttpActionResult PostPrincipal(Principal principal)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Principals.Add(principal);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = principal.Id }, principal);
        }

        // DELETE: api/Principals/5
        [ResponseType(typeof(Principal))]
        public IHttpActionResult DeletePrincipal(int id)
        {
            Principal principal = db.Principals.Find(id);
            if (principal == null)
            {
                return NotFound();
            }

            db.Principals.Remove(principal);
            db.SaveChanges();

            return Ok(principal);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PrincipalExists(int id)
        {
            return db.Principals.Count(e => e.Id == id) > 0;
        }
    }
}