using Microsoft.AspNet.OData;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeopleController : ODataController
    {
        private Context db;

        public PeopleController(Context db)
        {
            this.db = db;
        }

        // GET: odata/People
        [EnableQuery]
        public IQueryable<Person> Get()
        {
            return db.People;
        }

        // GET: odata/People(5)
        [EnableQuery]
        public SingleResult<Person> Get([FromODataUri] int key)
        {
            return SingleResult.Create(db.People.Where(entity => entity.Id == key));
        }

        // PUT: odata/People(5)
        public IActionResult Put([FromODataUri] int key, Delta<Person> patch)
        {
            if (!TryValidateModel(patch.GetInstance()))
            {
                return BadRequest(ModelState);
            }

            var entity = db.People.Find(key);
            if (entity == null)
            {
                return NotFound();
            }

            patch.Put(entity);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(entity);
        }

        // POST: odata/People
        public IActionResult Post(Person value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.People.Add(value);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (Exists(value.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(value);
        }

        // PATCH: odata/People(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IActionResult Patch([FromODataUri] int key, Delta<Person> patch)
        {
            if (!TryValidateModel(patch.GetInstance()))
            {
                return BadRequest(ModelState);
            }

            var entity = db.People.Find(key);
            if (entity == null)
            {
                return NotFound();
            }

            patch.Patch(entity);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(entity);
        }

        // DELETE: odata/People(5)
        public IActionResult Delete([FromODataUri] int key)
        {
            var entity = db.People.Find(key);
            if (entity == null)
            {
                return NotFound();
            }

            db.People.Remove(entity);
            db.SaveChanges();

            return NoContent();
        }


        private bool Exists(int key)
        {
            return db.People.Count(e => e.Id == key) > 0;
        }
    }
}
