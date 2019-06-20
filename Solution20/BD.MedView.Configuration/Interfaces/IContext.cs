using System.Data.Entity;

namespace BD.MedView.Configuration
{
    public interface IContext
    {
        IDbSet<ProviderStates> ProviderStates { get; set; }
        IDbSet<WidgetStates> WidgetStates { get; set; }
        IDbSet<GlobalPreferences> GlobalPreferences { get; set; }
        IDbSet<UserPreferences> UserPreferences { get; set; }
        IDbSet<FacilityPatientIdMapping> FacilityPatientIdMappings { get; set; }
        IDbSet<PatientIdKindFhirServiceMapping> PatientIdKindFhirServiceMappings { get; set; }

        void MigrateAccount(MigrateRequest request);
        void SeedUserStatesMappings();
        int SaveChanges();
        void Update<TEntity>(TEntity value) where TEntity : class;
    }
}