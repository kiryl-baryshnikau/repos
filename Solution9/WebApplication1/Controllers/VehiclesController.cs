using Microsoft.AspNet.OData;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ODataController
    {
        private Context db;

        public VehiclesController(Context db)
        {
            this.db = db;
        }

        // GET: odata/Vehicles
        [EnableQuery]
        public IQueryable<Vehicle> Get()
        {
            return db.Vehicles;
        }

        // GET: odata/Vehicles(5)
        [EnableQuery]
        public SingleResult<Vehicle> Get([FromODataUri] int key)
        {
            return SingleResult.Create(db.Vehicles.Where(entity => entity.Id == key));
        }

        // PUT: odata/Vehicles(5)
        public IActionResult Put([FromODataUri] int key, Delta<Vehicle> patch)
        {
            if (!TryValidateModel(patch.GetInstance()))
            {
                return BadRequest(ModelState);
            }

            var entity = db.Vehicles.Find(key);
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

        // POST: odata/Vehicles
        public IActionResult Post(Vehicle value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Vehicles.Add(value);

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

        // PATCH: odata/Vehicles(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IActionResult Patch([FromODataUri] int key, Delta<Vehicle> patch)
        {
            if (!TryValidateModel(patch.GetInstance()))
            {
                return BadRequest(ModelState);
            }

            var entity = db.Vehicles.Find(key);
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

        // DELETE: odata/Vehicles(5)
        public IActionResult Delete([FromODataUri] int key)
        {
            var entity = db.Vehicles.Find(key);
            if (entity == null)
            {
                return NotFound();
            }

            db.Vehicles.Remove(entity);
            db.SaveChanges();

            return NoContent();
        }


        private bool Exists(int key)
        {
            return db.Vehicles.Count(e => e.Id == key) > 0;
        }
    }
}
