using System;
using System.Linq;
using System.Threading;
using System.Data.Entity;
using BD.MedView.Authorization;
using BD.MedView.Facility;
using System.Collections.Generic;
using System.Linq.Expressions;
using BD.MedView.Configuration;
using BD.MedView.Runtime;
using Common.Logging;

namespace BD.MedView.Services.Services
{
    public interface ISecurityService :
        IEntitySecurity<Models.Source>,
        IEntitySecurity<Facility.Facility>,
        IEntitySecurity<Facility.Provider>,
        IEntitySecurity<Facility.Synonym>,
        IEntitySecurity<Authorization.Principal>,
        IEntitySecurity<Authorization.PrincipalClaim>,
        IEntitySecurity<Authorization.Role>,
        IEntityLinkSecurity<Authorization.Principal, Authorization.Role>,
        IEntityLinkSecurity<Authorization.Role, Authorization.Principal>,
        IEntitySecurity<Configuration.UserPreference>,
        IEntitySecurity<Configuration.FacilityPatientIdMapping>,
        ICacheSecurity,
        IEntitySecurity<Runtime.AttentionNoticeStatus>,
        IEntitySecurity<Runtime.LastActiveRoute>,
        IEntityAccessSecurity<Authorization.Access>,
        IEntitySecurity<Configuration.GlobalPreference>
    {
    }

    public class SecurityService : ISecurityService
    {
        private readonly ILog log;
        private readonly Authorization.IContext context;

        public SecurityService(ILog log, Authorization.IContext context)
        {
            this.log = log;
            this.context = context;
        }

        #region private 
        private System.Security.Claims.ClaimsIdentity GetIdentity()
        {
            var value = Thread.CurrentPrincipal.Identity as System.Security.Claims.ClaimsIdentity;
            if (value == null)
            {
                throw new UnauthorizedAccessException();
            }
            return value;
        }
        private System.Security.Claims.ClaimsIdentity GetAuthorizedIdentity()
        {
            var value = GetIdentity();
            if (!value.IsAuthenticated)
            {
                throw new UnauthorizedAccessException();
            }
            return value;
        }

        private Authorization.Principal GetAuthPrincipal()
        {
            var identity = GetAuthorizedIdentity();

            var principal = context.Principals
                                   .Include(item => item.Roles.Select(r => r.Realm))
                                   .FirstOrDefault(item => item.Name == identity.Name);
            if (principal == null)
            {
                throw new UnauthorizedAccessException();
            }
            return principal;
        }

        private void CheckSuper()
        {
            var principal = GetAuthPrincipal();
            if (!principal.Roles.Any(item => item.Name == "BD.MedView.Web.Super" && item.Realm.ParentId == null))
            {
                throw new UnauthorizedAccessException();
            }
        }

        private void CheckAuthPrincipal()
        {
            GetAuthPrincipal();
        }

        public bool IsSuper(Authorization.Principal value)
        {
            return value.Roles.Any(item => item.Name == "BD.MedView.Web.Super" && item.Realm.ParentId == null);
        }

        public bool IsSystem(Authorization.Principal value)
        {
            return value.Roles.Any(item => item.Name == "BD.MedView.Web.System" && item.Realm.ParentId == null);
        }

        public bool IsAdmin(Authorization.Principal value)
        {
            return WhereAdmin(value).Any();
        }

        public IEnumerable<int> WhereAdmin(Authorization.Principal value)
        {
            return value.Roles
                .Where(item => item.Name == "BD.MedView.Web.Admin" && item.Realm.ParentId != null)
                .Select(item => item.RealmId).Distinct();
        }
        #endregion

        #region IEntitySecurity<Models.Source>
        void IEntitySecurity<Models.Source>.ValidateCreate(Models.Source value)
        {
            throw new NotImplementedException();
        }

        void IEntitySecurity<Models.Source>.ValidateDelete(Models.Source value)
        {
            throw new NotImplementedException();
        }

        void IEntitySecurity<Models.Source>.ValidateRead(Models.Source value, string expand)
        {
            //CheckSuper();
        }

        IQueryable<Models.Source> IEntitySecurity<Models.Source>.ValidateSelect(IQueryable<Models.Source> values, string expand)
        {
            //CheckSuper();
            return values;
        }

        void IEntitySecurity<Models.Source>.ValidateUpdate(Models.Source entity, Models.Source value)
        {
            throw new NotImplementedException();
        }
        #endregion

        #region IEntitySecurity<Facility.Facility>
        void IEntitySecurity<Facility.Facility>.ValidateCreate(Facility.Facility value)
        {
            CheckSuper();
        }

        void IEntitySecurity<Facility.Facility>.ValidateDelete(Facility.Facility value)
        {
            CheckSuper();
        }

        void IEntitySecurity<Facility.Facility>.ValidateRead(Facility.Facility value, string expand)
        {
            //CheckSuper();
        }

        IQueryable<Facility.Facility> IEntitySecurity<Facility.Facility>.ValidateSelect(IQueryable<Facility.Facility> values, string expand)
        {
            //CheckSuper();
            return values;
        }

        void IEntitySecurity<Facility.Facility>.ValidateUpdate(Facility.Facility entity, Facility.Facility value)
        {
            CheckSuper();
        }
        #endregion

        #region IEntitySecurity<Facility.Provider>
        void IEntitySecurity<Provider>.ValidateUpdate(Provider entity, Provider value)
        {
            CheckSuper();
        }

        IQueryable<Provider> IEntitySecurity<Provider>.ValidateSelect(IQueryable<Provider> values, string expand)
        {
            //CheckSuper();
            return values;
        }

        void IEntitySecurity<Provider>.ValidateRead(Provider value, string expand)
        {
            //CheckSuper();
        }

        void IEntitySecurity<Provider>.ValidateDelete(Provider value)
        {
            CheckSuper();
        }

        void IEntitySecurity<Provider>.ValidateCreate(Provider value)
        {
            CheckSuper();
        }
        #endregion

        #region IEntitySecurity<Facility.Synonym>
        void IEntitySecurity<Synonym>.ValidateUpdate(Synonym entity, Synonym value)
        {
            CheckSuper();
        }

        IQueryable<Synonym> IEntitySecurity<Synonym>.ValidateSelect(IQueryable<Synonym> values, string expand)
        {
            //CheckSuper();
            return values;
        }

        void IEntitySecurity<Synonym>.ValidateRead(Synonym value, string expand)
        {
            //CheckSuper();
        }

        void IEntitySecurity<Synonym>.ValidateDelete(Synonym value)
        {
            CheckSuper();
        }

        void IEntitySecurity<Synonym>.ValidateCreate(Synonym value)
        {
            CheckSuper();
        }
        #endregion

        #region IEntitySecurity<Principal>
        void IEntitySecurity<Principal>.ValidateUpdate(Principal entity, Principal value)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                return;
            }
            if (IsSystem(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        IQueryable<Principal> IEntitySecurity<Principal>.ValidateSelect(IQueryable<Principal> values, string expand)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                return values.Where(item => item.Name != "BD.MedView.Authorization.System");
            }
            if (IsSystem(principal))
            {
                return values.Where(item => item.Name != "BD.MedView.Authorization.System");
            }
            if (IsAdmin(principal))
            {
                return values.Where(item => item.Name != "BD.MedView.Authorization.System");
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Principal>.ValidateRead(Principal value, string expand)
        {
            var principal = GetAuthPrincipal();
            //TODO: KB: Validate This
            if (IsSuper(principal) || IsSystem(principal) || IsAdmin(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Principal>.ValidateDelete(Principal value)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Principal>.ValidateCreate(Principal value)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal) || IsSystem(principal) || IsAdmin(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region IEntitySecurity<PrincipalClaim>
        void IEntitySecurity<PrincipalClaim>.ValidateUpdate(PrincipalClaim entity, PrincipalClaim value)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal) || IsSystem(principal) || IsAdmin(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        IQueryable<PrincipalClaim> IEntitySecurity<PrincipalClaim>.ValidateSelect(IQueryable<PrincipalClaim> values, string expand)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal) || IsSystem(principal) || IsAdmin(principal))
            {
                return values.Where(item => item.Principal.Name != "BD.MedView.Authorization.System");
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<PrincipalClaim>.ValidateRead(PrincipalClaim value, string expand)
        {
            var principal = GetAuthPrincipal();
            //TODO: KB: Validate This
            if (IsSuper(principal) || IsSystem(principal) || IsAdmin(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<PrincipalClaim>.ValidateDelete(PrincipalClaim value)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal) || IsSystem(principal) || IsAdmin(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<PrincipalClaim>.ValidateCreate(PrincipalClaim value)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal) || IsSystem(principal) || IsAdmin(principal))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region IEntitySecurity<Role>
        void IEntitySecurity<Role>.ValidateUpdate(Role entity, Role value)
        {
            throw new UnauthorizedAccessException();
        }

        IQueryable<Role> IEntitySecurity<Role>.ValidateSelect(IQueryable<Role> values, string expand)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                var systemRoles = new[] { "BD.MedView.Web.Super", "BD.MedView.Web.System" };
                var facilityRoles = new[] { "BD.MedView.Web.Admin", "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                return values.Where(item => (systemRoles.Contains(item.Name) && item.Realm.ParentId == null) || (facilityRoles.Contains(item.Name) && item.Realm.ParentId != null));
            }

            if (IsSystem(principal))
            {
                var systemRoles = new[] { "BD.MedView.Web.System" };
                var facilityRoles = new[] { "BD.MedView.Web.Admin", "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                return values.Where(item => (systemRoles.Contains(item.Name) && item.Realm.ParentId == null) || (facilityRoles.Contains(item.Name) && item.Realm.ParentId != null));
            }

            if (IsAdmin(principal))
            {
                var facilityRoles = new[] { "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                var ret = null as IQueryable<Role>;
                foreach (var realmId in WhereAdmin(principal))
                {
                    ret = (ret == null)
                        ? values.Where(item => item.RealmId == realmId && item.Realm.ParentId != null)
                        : ret.Union(values.Where(item => item.RealmId == realmId && item.Realm.ParentId != null));
                }
                return ret.Where(item => facilityRoles.Contains(item.Name));
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Role>.ValidateRead(Role value, string expand)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                var systemRoles = new[] { "BD.MedView.Web.Super", "BD.MedView.Web.System" };
                var facilityRoles = new[] { "BD.MedView.Web.Admin", "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                if (systemRoles.Contains(value.Name) && value.Realm.ParentId == null || facilityRoles.Contains(value.Name) && value.Realm.ParentId != null)
                {
                    return;
                }
            }

            if (IsSystem(principal))
            {
                var systemRoles = new[] { "BD.MedView.Web.System" };
                var facilityRoles = new[] { "BD.MedView.Web.Admin", "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                if (systemRoles.Contains(value.Name) && value.Realm.ParentId == null || facilityRoles.Contains(value.Name) && value.Realm.ParentId != null)
                {
                    return;
                }
            }

            if (IsAdmin(principal))
            {
                var facilityRoles = new[] { "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                var availableRealms = WhereAdmin(principal);
                if (facilityRoles.Contains(value.Name) && availableRealms.Contains(value.RealmId))
                {
                    return;
                }
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Role>.ValidateDelete(Role value)
        {
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Role>.ValidateCreate(Role value)
        {
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region IEntityLinkSecurity<Principal, Role>
        void IEntityLinkSecurity<Principal, Role>.ValidateAdd(Principal entity, Role link, Expression<Func<Principal, ICollection<Role>>> expression)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                return;
            }
            if (IsSystem(principal))
            {
                (this as IEntitySecurity<Principal>).ValidateRead(entity, null);
                (this as IEntitySecurity<Role>).ValidateRead(link, null);
                return;
            }
            if (IsAdmin(principal))
            {
                (this as IEntitySecurity<Principal>).ValidateRead(entity, null);
                (this as IEntitySecurity<Role>).ValidateRead(link, null);
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntityLinkSecurity<Principal, Role>.ValidateRemove(Principal entity, Role link, Expression<Func<Principal, ICollection<Role>>> expression)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                return;
            }
            if (IsSystem(principal))
            {
                (this as IEntitySecurity<Principal>).ValidateRead(entity, null);
                (this as IEntitySecurity<Role>).ValidateRead(link, null);
                return;
            }
            if (IsAdmin(principal))
            {
                (this as IEntitySecurity<Principal>).ValidateRead(entity, null);
                (this as IEntitySecurity<Role>).ValidateRead(link, null);
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region IEntityLinkSecurity<Role, Principal>
        void IEntityLinkSecurity<Role, Principal>.ValidateAdd(Role entity, Principal link, Expression<Func<Role, ICollection<Principal>>> expression)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                return;
            }
            if (IsSystem(principal))
            {
                (this as IEntitySecurity<Role>).ValidateRead(entity, null);
                (this as IEntitySecurity<Principal>).ValidateRead(link, null);
                return;
            }
            if (IsAdmin(principal))
            {
                (this as IEntitySecurity<Role>).ValidateRead(entity, null);
                (this as IEntitySecurity<Principal>).ValidateRead(link, null);
                return;
            }
            throw new UnauthorizedAccessException();
        }
        void IEntityLinkSecurity<Role, Principal>.ValidateRemove(Role entity, Principal link, Expression<Func<Role, ICollection<Principal>>> expression)
        {
            var principal = GetAuthPrincipal();
            if (IsSuper(principal))
            {
                return;
            }
            if (IsSystem(principal))
            {
                (this as IEntitySecurity<Role>).ValidateRead(entity, null);
                (this as IEntitySecurity<Principal>).ValidateRead(link, null);
                return;
            }
            if (IsAdmin(principal))
            {
                (this as IEntitySecurity<Role>).ValidateRead(entity, null);
                (this as IEntitySecurity<Principal>).ValidateRead(link, null);
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region IEntitySecurity<Configuration.UserPreferences>
        void IEntitySecurity<Configuration.UserPreference>.ValidateUpdate(Configuration.UserPreference entity, Configuration.UserPreference value)
        {
            var principal = GetAuthPrincipal();
            if (IsAdmin(principal) || IsSystem(principal) || IsSuper(principal))
            {
                return;
            }
            if (value.User == entity.User && entity.User == principal.Name)
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        IQueryable<Configuration.UserPreference> IEntitySecurity<Configuration.UserPreference>.ValidateSelect(IQueryable<Configuration.UserPreference> values, string expand)
        {
            var principal = GetAuthPrincipal();
            return values.Where(item => item.User == principal.Name);
        }

        void IEntitySecurity<Configuration.UserPreference>.ValidateRead(Configuration.UserPreference value, string expand)
        {
            var principal = GetAuthPrincipal();
            if (string.Equals(principal.Name, value.User, StringComparison.CurrentCultureIgnoreCase))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Configuration.UserPreference>.ValidateDelete(Configuration.UserPreference value)
        {
            var principal = GetAuthPrincipal();
            if (string.Equals(principal.Name, value.User, StringComparison.CurrentCultureIgnoreCase))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<Configuration.UserPreference>.ValidateCreate(Configuration.UserPreference value)
        {
            var principal = GetAuthPrincipal();
            if (string.Equals(principal.Name, value.User, StringComparison.CurrentCultureIgnoreCase))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region ICacheSecurity
        void ICacheSecurity.ValidateGet(string key)
        {
            var principal = GetAuthPrincipal();
            //Add additional checks here
            return;
        }

        void ICacheSecurity.ValidateRefresh(string key)
        {
            var principal = GetAuthPrincipal();
            //Add additional checks here
            return;
        }

        void ICacheSecurity.ValidateRemove(string key)
        {
            var principal = GetAuthPrincipal();
            //Add additional checks here
            return;
        }

        void ICacheSecurity.ValidateSet(string key, string value, CacheServiceOptions options)
        {
            var principal = GetAuthPrincipal();
            //Add additional checks here
            return;
        }
        #endregion

        #region IEntitySecurity<Configuration.FacilityPatientIdMapping>
        IQueryable<FacilityPatientIdMapping> IEntitySecurity<Configuration.FacilityPatientIdMapping>.ValidateSelect(IQueryable<Configuration.FacilityPatientIdMapping> values, string expand)
        {
            var principal = GetAuthPrincipal();
            return values;
        }

        void IEntitySecurity<Configuration.FacilityPatientIdMapping>.ValidateRead(Configuration.FacilityPatientIdMapping value, string expand)
        {
            var principal = GetAuthPrincipal();
        }

        void IEntitySecurity<Configuration.FacilityPatientIdMapping>.ValidateUpdate(Configuration.FacilityPatientIdMapping entity, Configuration.FacilityPatientIdMapping value)
        {
            throw new NotImplementedException();
        }

        void IEntitySecurity<Configuration.FacilityPatientIdMapping>.ValidateDelete(Configuration.FacilityPatientIdMapping value)
        {
            throw new NotImplementedException();
        }

        void IEntitySecurity<Configuration.FacilityPatientIdMapping>.ValidateCreate(Configuration.FacilityPatientIdMapping value)
        {
            throw new NotImplementedException();
        }
        #endregion

        #region IEntitySecurity<AttentionNoticeStatus>
        IQueryable<AttentionNoticeStatus> IEntitySecurity<AttentionNoticeStatus>.ValidateSelect(IQueryable<AttentionNoticeStatus> values, string expand)
        {
            CheckAuthPrincipal();
            return values;
        }

        void IEntitySecurity<AttentionNoticeStatus>.ValidateRead(AttentionNoticeStatus value, string expand)
        {
            CheckAuthPrincipal();
        }

        void IEntitySecurity<AttentionNoticeStatus>.ValidateUpdate(AttentionNoticeStatus entity, AttentionNoticeStatus value)
        {
            CheckAttentionNoticeStatusValue(entity);
            CheckAttentionNoticeStatusValue(value);
        }

        void IEntitySecurity<AttentionNoticeStatus>.ValidateDelete(AttentionNoticeStatus value)
        {
            CheckAttentionNoticeStatusValue(value);
        }

        void IEntitySecurity<AttentionNoticeStatus>.ValidateCreate(AttentionNoticeStatus value)
        {
            CheckAttentionNoticeStatusValue(value);
        }

        private void CheckAttentionNoticeStatusValue(AttentionNoticeStatus value)
        {
            var principal = GetAuthPrincipal();
            //var facilityRoles = new[] { "BD.MedView.Web.Pharmacist", "BD.MedView.Web.Technician" };
            //var facilityIds = principal.Roles
            //    .Where(item => (facilityRoles.Contains(item.Name) && item.Realm.ParentId != null))
            //    .Select(item => item.Realm)
            //    .SelectMany(item => item.Claims)
            //    .Where(item => item.Issuer == "BD.MedView.Facility"
            //                    && item.OriginalIssuer == "BD.MedView.Facility"
            //                    && item.Type == "Provider.Id"
            //                    && item.ValueType == "Int32")
            //    .Select(item => Convert.ToInt32(item.Value))
            //    .Distinct();
            //if (facilityIds.Contains(value.FacilityId))
            //{
            //    return;
            //}
            var resourceNames = new[] { "BD.MedView.Web.Screens.Pharmacist", "BD.MedView.Web.Screens.Technician" };
            var facilityIdsQuery = context.Accesses
                .Where(item => item.PrincipalId == principal.Id)
                .Where(item => resourceNames.Contains(item.Permission.Resource.Name))
                .SelectMany(item => item.Realm.Claims)
                .Where(item => item.Issuer == "BD.MedView.Facility"
                                && item.OriginalIssuer == "BD.MedView.Facility"
                                && item.Type == "Provider.Id"
                                && item.ValueType == "Int32")
                .Select(item => item.Value)
                .Distinct();
            var facilityIds = facilityIdsQuery.AsEnumerable()
                .Select(item => int.Parse(item))
                .ToList();
            if (facilityIds.Contains(value.FacilityId))
            //if (facilityIds.Any())
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region IEntityAccessSecurity<Access>
        IQueryable<Access> IEntityAccessSecurity<Access>.ValidateSelect(IQueryable<Access> values, string expand)
        {
            var principal = GetAuthPrincipal();
            return values.Where(item => item.PrincipalId == principal.Id);
        }

        void IEntityAccessSecurity<Access>.ValidateRead(Access value, string expand)
        {
            var principal = GetAuthPrincipal();
            if (value.PrincipalId == principal.Id)
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion

        #region IEntitySecurity<AttentionNoticeStatus>
        void IEntitySecurity<LastActiveRoute>.ValidateUpdate(LastActiveRoute entity, LastActiveRoute value)
        {
            var principal = GetAuthPrincipal();
            if (IsAdmin(principal) || IsSystem(principal) || IsSuper(principal))
            {
                return;
            }
            if (value.User == entity.User && entity.User == principal.Name)
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        IQueryable<LastActiveRoute> IEntitySecurity<LastActiveRoute>.ValidateSelect(IQueryable<LastActiveRoute> values, string expand)
        {
            var principal = GetAuthPrincipal();
            return values.Where(item => item.User == principal.Name);
        }

        void IEntitySecurity<LastActiveRoute>.ValidateRead(LastActiveRoute value, string expand)
        {
            var principal = GetAuthPrincipal();
            if (string.Equals(principal.Name, value.User, StringComparison.CurrentCultureIgnoreCase))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<LastActiveRoute>.ValidateDelete(LastActiveRoute value)
        {
            var principal = GetAuthPrincipal();
            if (string.Equals(principal.Name, value.User, StringComparison.CurrentCultureIgnoreCase))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }

        void IEntitySecurity<LastActiveRoute>.ValidateCreate(LastActiveRoute value)
        {
            var principal = GetAuthPrincipal();
            if (string.Equals(principal.Name, value.User, StringComparison.CurrentCultureIgnoreCase))
            {
                return;
            }
            throw new UnauthorizedAccessException();
        }
        #endregion


        #region IEntitySecurity<GlobalPreference>
        void IEntitySecurity<GlobalPreference>.ValidateUpdate(GlobalPreference entity, GlobalPreference value)
        {
            CheckAuthPrincipal();
        }

        IQueryable<GlobalPreference> IEntitySecurity<GlobalPreference>.ValidateSelect(IQueryable<GlobalPreference> values, string expand)
        {
            CheckAuthPrincipal();
            return values;
        }

        void IEntitySecurity<GlobalPreference>.ValidateRead(GlobalPreference value, string expand)
        {
            CheckAuthPrincipal();
        }

        void IEntitySecurity<GlobalPreference>.ValidateDelete(GlobalPreference value)
        {
            CheckAuthPrincipal();
        }

        void IEntitySecurity<GlobalPreference>.ValidateCreate(GlobalPreference value)
        {
            CheckAuthPrincipal();
        }
        #endregion
    }
}