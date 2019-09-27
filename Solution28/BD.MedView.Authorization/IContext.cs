using System;
using System.Data.Entity;

namespace BD.MedView.Authorization
{
    public interface IContext: IDisposable
    {
        IDbSet<Permission> Permissions { get; set; }
        IDbSet<Principal> Principals { get; set; }
        IDbSet<PrincipalClaim> PrincipalClaims { get; set; }
        IDbSet<Realm> Realms { get; set; }
        IDbSet<RealmClaim> RealmClaims { get; set; }
        IDbSet<Resource> Resources { get; set; }
        IDbSet<Role> Roles { get; set; }
        IDbSet<Access> Accesses { get; set; }

        int SaveChanges();
    }
}