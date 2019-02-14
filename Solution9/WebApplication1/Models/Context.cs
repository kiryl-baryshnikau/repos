using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Models
{
    public class Context : DbContext
    {
        public Context(DbContextOptions<Context> options) : base(options)
        {
            //Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Person>()
                .HasKey(e => e.Id);
            modelBuilder.Entity<Person>()
                .Ignore(e => e.Vehicles);
            modelBuilder.Entity<Vehicle>()
                .HasKey(e => e.Id);
            modelBuilder.Entity<Vehicle>()
                .Ignore(e => e.People);

            modelBuilder.Entity<PersonVehicle>()
                .HasKey(bc => new { bc.PersonId, bc.VehicleId });

            modelBuilder.Entity<PersonVehicle>()
                .HasOne(e => e.Person)
                .WithMany(e => e.PersonVehicles)
                .HasForeignKey(e => e.PersonId);
            modelBuilder.Entity<PersonVehicle>()
                .HasOne(e => e.Vehicle)
                .WithMany(e => e.PersonVehicles)
                .HasForeignKey(e => e.VehicleId);
        }

        public DbSet<Person> People { get; set; }
        public DbSet<PersonVehicle> PersonVehicles { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
    }
}
