namespace ConsoleApp1
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class Model1 : DbContext
    {
        public Model1()
            : base("name=Model1")
        {
        }

        public virtual DbSet<ContainerAndGrwarnings> vw_ContainerAndGrwarnings { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ContainerAndGrwarnings>()
                .Property(e => e.FacilityId)
                .IsUnicode(false);

            modelBuilder.Entity<ContainerAndGrwarnings>()
                .Property(e => e.AccountNumber)
                .IsUnicode(false);
        }
    }
}
