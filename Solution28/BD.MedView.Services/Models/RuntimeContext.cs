using System.Data;
using System.Data.Common;
using System.Data.Entity;
using System.Data.SqlClient;
using BD.MedView.Runtime;
using BD.MedView.Services.Utilities;

namespace BD.MedView.Services.Models
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class RuntimeContext : DbContext, IContext
    {
        private readonly IContextResolver contextResolver;

        static RuntimeContext()
        {
            Database.SetInitializer((IDatabaseInitializer<RuntimeContext>)null);
        }

        public RuntimeContext(IContextResolver contextResolver) : base("name=BD.MedView.Services.Models.RuntimeContext")
        {
            this.contextResolver = contextResolver;

            Configuration.LazyLoadingEnabled = false;
            Configuration.ProxyCreationEnabled = false;
            if (this.contextResolver != null)
            {
                Database.Connection.StateChange += Connection_StateChange;
            }
        }

        public RuntimeContext(IContextResolver contextResolver, DbConnection existingConnection, bool contextOwnsConnection)
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

        public IDbSet<AttentionNoticeStatus> AttentionNoticeStatuses { get; set; }
        public IDbSet<LastActiveRoute> LastActiveRoutes { get; set; }
        public IDbSet<AttentionNoticeStatusTracker> AttentionNoticeStatusTrackers { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //TODO: KB: As soon as clases used in both actual and historical contexts we cannot rely on attribute base mapping
            modelBuilder.HasDefaultSchema("rnt");
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
