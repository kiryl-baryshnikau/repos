namespace ConsoleApp2
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class Context : DbContext
    {
        public Context()
            : base("name=Context")
        {
        }

        public virtual DbSet<ContainerAndGuardrailWarnings> vw_ContainerAndGrwarnings { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ContainerAndGuardrailWarnings>()
                .Property(e => e.FacilityId)
                .IsUnicode(false);

            modelBuilder.Entity<ContainerAndGuardrailWarnings>()
                .Property(e => e.AccountNumber)
                .IsUnicode(false);
        }
    }
}
