using BD.MedView.Authorization;
using System.Data.Entity;

namespace BD.MedView.Services.Models
{
    public class AuthorizationContext : DbContext, IContext
    {
        static AuthorizationContext()
        {
            Database.SetInitializer(new AuthorizationInitializer());
        }

        public AuthorizationContext(string nameOrConnectionString)
                : base("name=BD.MedView.Services.Models.AuthorizationContext")
        {
        }

        public IDbSet<Permission> Permissions { get; set; }
        public IDbSet<Principal> Principals { get; set; }
        public IDbSet<PrincipalClaim> PrincipalClaims { get; set; }
        public IDbSet<Realm> Realms { get; set; }
        public IDbSet<RealmClaim> RealmClaims { get; set; }
        public IDbSet<Resource> Resources { get; set; }
        public IDbSet<Role> Roles { get; set; }
        public IDbSet<Access> Accesses { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("auth");
        }
    }
}