using BD.MedView.Authorization;
using System.Data.Entity;

namespace BD.MedView.Services.Models
{
    public class AuthorizationInitializer : DropCreateDatabaseIfModelChanges<AuthorizationContext>
    {
        protected override void Seed(AuthorizationContext context)
        {
            (context.Principals as DbSet<Principal>).AddRange(new [] 
            {
                new Principal { Name = "Juliette" },
                new Principal { Name = "Romeo" }
            });
        }
    }

}
