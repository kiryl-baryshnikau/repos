using System.Data.Entity;
using BD.MedView.Facility;
using System.Data;
using System.Data.SqlClient;
using System.Data.Common;
using BD.MedView.Services.Utilities;

namespace BD.MedView.Services.Models
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class FacilityContext : DbContext, IContext
    {
        private readonly IContextResolver contextResolver;

        static FacilityContext()
        {
            Database.SetInitializer((IDatabaseInitializer<FacilityContext>)null);
        }

        public FacilityContext(IContextResolver contextResolver) : base("name=BD.MedView.Services.Models.FacilityContext")
        {
            this.contextResolver = contextResolver;

            Configuration.LazyLoadingEnabled = false;
            Configuration.ProxyCreationEnabled = false;

            if (this.contextResolver != null)
            {
                Database.Connection.StateChange += Connection_StateChange;
            }
        }

        public FacilityContext(IContextResolver contextResolver, DbConnection existingConnection, bool contextOwnsConnection)
                : base(existingConnection, contextOwnsConnection)
        {
            this.contextResolver = contextResolver;

            Configuration.LazyLoadingEnabled = false;
            Configuration.ProxyCreationEnabled = false;

            if (this.contextResolver != null)
            {
                Database.Connection.StateChange += Connection_StateChange;
            }
        }

        public IDbSet<Facility.Facility> Facilities { get; set; }
        public IDbSet<Unit> Units { get; set; }
        public IDbSet<Idn> Idns { get; set; }
        public IDbSet<Provider> Providers { get; set; }
        public IDbSet<Synonym> Synonyms { get; set; }
        public IDbSet<Root> Roots { get; set; }
        public IDbSet<KeyType> KeyTypes { get; set; }
        public IDbSet<Element> Elements { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //TODO: KB: As soon as clases used in both actual and historical contexts we cannot rely on attribute base mapping
            modelBuilder.HasDefaultSchema("fas");
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
    }
}
