using System.Data.Entity;

namespace BD.MedView.Configuration
{
    public interface IContext
    {
        IDbSet<ProviderState> ProviderStates { get; set; }
        IDbSet<WidgetState> WidgetStates { get; set; }
        //IDbSet<GlobalPreferences> GlobalPreferences { get; set; }
        IDbSet<GlobalPreference> GlobalPreferences { get; set; }
        IDbSet<UserPreference> UserPreferences { get; set; }
        IDbSet<FacilityPatientIdMapping> FacilityPatientIdMappings { get; set; }
        IDbSet<PatientIdKindFhirServiceMapping> PatientIdKindFhirServiceMappings { get; set; }

        void MigrateAccount(MigrateRequest request);
        void SeedUserStatesMappings();
        int SaveChanges();
        void Update<TEntity>(TEntity value) where TEntity : class;
    }
}