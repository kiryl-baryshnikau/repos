using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ConsoleApp1
{
    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<Vehicle> Vehicles { get; set; }
    }

    public class Vehicle
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<Person> People { get; set; }
    }


    public class Context : DbContext
    {
        public Context(DbContextOptions<Context> options) : base(options)
        {
            //Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Person>()
                .HasMany<Vehicle>(s => s.Vehicles)
                //This feature must  be implemented.
                .WithMany(c => c.People)
                .Map(cs =>
                {
                    cs.MapLeftKey("PersonId");
                    cs.MapRightKey("VehiclesId");
                    cs.ToTable("PersonVehicles");
                });
        }

        public DbSet<Person> People { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
    }
}
