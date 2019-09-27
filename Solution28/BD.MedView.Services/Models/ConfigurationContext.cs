using System;
using System.Data.Entity;
using System.Data;
using System.Data.SqlClient;
using System.Data.Entity.ModelConfiguration.Conventions;
using BD.MedView.Configuration;
using BD.MedView.Services.Utilities;
using System.Data.Common;

namespace BD.MedView.Services.Models
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class ConfigurationContext : DbContext, IContext
    {
        private readonly IContextResolver contextResolver;

        static ConfigurationContext()
        {
            Database.SetInitializer((IDatabaseInitializer<ConfigurationContext>)null);
        }

        public ConfigurationContext(IContextResolver contextResolver) : base("name=BD.MedView.Services.Models.ConfigurationContext")
        {
            this.contextResolver = contextResolver;

            Configuration.LazyLoadingEnabled = false;
            Configuration.ProxyCreationEnabled = false;

            if (this.contextResolver != null)
            {
                Database.Connection.StateChange += Connection_StateChange;
            }
        }
        public ConfigurationContext(IContextResolver contextResolver, DbConnection existingConnection, bool contextOwnsConnection) : base(existingConnection, contextOwnsConnection)
        {
                this.contextResolver = contextResolver;

                Configuration.LazyLoadingEnabled = false;
                Configuration.ProxyCreationEnabled = false;

                if (this.contextResolver != null)
                {
                    Database.Connection.StateChange += Connection_StateChange;
                }
            }

        public IDbSet<UserPreference> UserPreferences { get; set; }
        public IDbSet<GlobalPreference> GlobalPreferences { get; set; }
        public IDbSet<WidgetState> WidgetStates { get; set; }
        public IDbSet<ProviderState> ProviderStates { get; set; }
        public IDbSet<FacilityPatientIdMapping> FacilityPatientIdMappings { get; set; }
        public IDbSet<PatientIdKindFhirServiceMapping> PatientIdKindFhirServiceMappings { get; set; }

        public void MigrateAccount(MigrateRequest request)
        {
            var appCodes = BuildAppCodesParameter(request);
            SqlParameter oldUserNameParam = new SqlParameter("@oldUserName", request.OldPrincipalName);
            SqlParameter newUserNameParam = new SqlParameter("@newUserName", request.NewPrincipalName);
            SqlParameter appCodesParam = new SqlParameter("@appCodes", appCodes)
            {
                SqlDbType = SqlDbType.Structured,
                TypeName = "Core.AppCodes"
            };

            this.Database
                .ExecuteSqlCommand("EXEC [Core].[usp_MigrateUserAccount] @oldUserName, @newUserName, @appCodes",
                    oldUserNameParam, newUserNameParam, appCodesParam);
        }

        public void SeedUserStatesMappings()
        {
            this.Database
                .ExecuteSqlCommand("EXEC [Core].[SeedUserStateMappings]");
        }

        private DataTable BuildAppCodesParameter(MigrateRequest request)
        {
            DataTable appCodes = new DataTable();
            appCodes.Columns.Add("AppCode", typeof(String));
            foreach (string item in request.AppCodes)
            {
                var workRow = appCodes.NewRow();
                workRow["AppCode"] = item.Trim();
                appCodes.Rows.Add(workRow);
            }
            return appCodes;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("conf");

            //modelBuilder.ComplexType<Configurations>()
            //            .Property(p => p.Serialized)
            //            .HasColumnName("Configurations");

            //modelBuilder.ComplexType<Configurations>().Ignore(p => p.GlobalUserSettings);

            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            modelBuilder.Entity<WidgetState>()
                .HasMany(c => c.ProviderStates).WithMany(i => i.WidgetStates)
                .Map(t => t.MapLeftKey("WidgetStateId")
                    .MapRightKey("ProviderStateId")
                    .ToTable("UserStatesMappings"));

            modelBuilder.Entity<FacilityPatientIdMapping>()
                .ToTable(nameof(FacilityPatientIdMappings));

            base.OnModelCreating(modelBuilder);
        }

        protected void Connection_StateChange(object sender, StateChangeEventArgs e)
        {
            if (e.OriginalState == ConnectionState.Open ||
                e.CurrentState != ConnectionState.Open)
                return;

            // use the existing open connection to set the context info
            //var connection = ((EntityConnection)sender).StoreConnection;
            var connection = (SqlConnection)sender;
            var command = connection.CreateCommand();
            command.CommandText = "[Core].SetContextInfo";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("user", this.contextResolver.User));
            command.Parameters.Add(new SqlParameter("activity", this.contextResolver.Activity));
            command.Parameters.Add(new SqlParameter("when", this.contextResolver.When));
            command.ExecuteNonQuery();
        }

        public void Update<TEntity>(TEntity value) where TEntity : class
        {
            this.Entry(value).State = EntityState.Modified;
        }
    }
}
