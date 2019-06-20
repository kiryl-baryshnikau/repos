using System.Collections.Generic;
using System.Data.Entity;

namespace WebApplication1.Models
{

    public class ContextInitializer : CreateDatabaseIfNotExists<Context>
    {
        protected override void Seed(Context context)
        {
            context.GlobalPreferences.Add(new GlobalPreferenceInt { Name = "A", IntProperty = 1, Type = "Type", Version = "1.0" });
            context.GlobalPreferences.Add(new GlobalPreferenceString { Name = "B", StringProperty = "A", Type = "Type", Version = "1.0" });
            context.GlobalPreferences.Add(new GlobalPreferenceEn1 { Name = "C", En1Property = En1.Val3, Type = "Type", Version = "1.0" });

            base.Seed(context);
        }
    }

    public class Context : DbContext
    {
        static Context()
        {
            Database.SetInitializer(new ContextInitializer());
        }

        public IDbSet<GlobalPreference> GlobalPreferences { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }

        public System.Data.Entity.DbSet<WebApplication1.Models.GlobalPreferenceInt> GlobalPreferenceInts { get; set; }

        public System.Data.Entity.DbSet<WebApplication1.Models.InfusionPreference> InfusionPreferences { get; set; }
    }
}