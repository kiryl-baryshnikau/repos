namespace ConsoleApp1
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

        public virtual DbSet<UserAccount> UserAccounts { get; set; }
        public virtual DbSet<UserClaim> UserClaims { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserAccount>()
                .HasMany(e => e.UserClaims)
                .WithRequired(e => e.UserAccount)
                .HasForeignKey(e => e.ParentKey);
        }
    }
}
