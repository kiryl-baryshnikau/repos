using System.Collections.Generic;
using System.Data.Entity;

namespace ConsoleApp2
{
    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<Vehicle> Vehicles { get; set; } = new HashSet<Vehicle>();
    }

    public class Vehicle
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual ICollection<Person> People { get; set; } = new HashSet<Person>();
    }


    public class Context : DbContext
    {
        public Context(string nameOrConnectionString) : base(nameOrConnectionString)
        {
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
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
