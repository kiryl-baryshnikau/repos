using BD.MedView.Authorization;
using BD.MedView.Services.Utilities;
using System.Data;
using System.Data.Common;
using System.Data.Entity;
using System.Data.SqlClient;

namespace BD.MedView.Services.Models
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class AuthorizationContext : DbContext, IContext
    {
        private readonly IContextResolver contextResolver;

        static AuthorizationContext()
        {
            Database.SetInitializer((IDatabaseInitializer<AuthorizationContext>)null);
        }

        public AuthorizationContext(IContextResolver contextResolver)
                : base("name=BD.MedView.Services.Models.AuthorizationContext")
        {
            this.contextResolver = contextResolver;

            Configuration.LazyLoadingEnabled = false;
            Configuration.ProxyCreationEnabled = false;

            if (this.contextResolver != null)
            {
                Database.Connection.StateChange += Connection_StateChange;
            }
        }

        public AuthorizationContext(IContextResolver contextResolver, DbConnection existingConnection, bool contextOwnsConnection)
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
            //TODO: KB: As soon as clases used in both actual and historical contexts we cannot rely on attribute base mapping
            modelBuilder.HasDefaultSchema("auth");
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