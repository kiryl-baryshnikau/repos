using BD.MedView.Authorization;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Web.Http;
using System.Data.Entity;

namespace BD.MedView.Services.Extensions
{
    public static class ApiControllerExtensions
    {
        public static void Check<T>(this ApiController obj, IContext db, T source, string action = "Read") where T : class
        {
            var ret = Filter(obj, db, new[] { source }.AsQueryable(), action);
            if (!ret.Any())
            {
                if (obj?.User?.Identity != null && obj.User.Identity.IsAuthenticated)
                {
                    throw new HttpResponseException(HttpStatusCode.Forbidden);
                }

                throw new HttpResponseException(HttpStatusCode.Unauthorized);
            }
        }

        public static IQueryable<T> Filter<T>(this ApiController obj, IContext db, IQueryable<T> source, string action = "Select") where T : class
        {
            var identity = obj.User.Identity as ClaimsIdentity;
            //check if principal is registered in the system
            if (identity == null)
            {
                if (obj?.User?.Identity != null && obj.User.Identity.IsAuthenticated)
                {
                    throw new HttpResponseException(HttpStatusCode.Forbidden);
                }

                throw new HttpResponseException(HttpStatusCode.Unauthorized);
            }

            var principal = db.Principals
                .Include(item => item.Roles.Select(r => r.Realm))
                .FirstOrDefault(item => item.Name == obj.User.Identity.Name);
            if (principal == null)
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }

            if (typeof(T) == typeof(Realm))
            {
                return Filter(principal, db, source.Cast<Realm>(), action).Cast<T>();
            }
            if (typeof(T) == typeof(Role))
            {
                return Filter(principal, db, source.Cast<Role>(), action).Cast<T>();
            }
            if (typeof(T) == typeof(Principal))
            {
                return Filter(principal, db, source.Cast<Principal>(), action).Cast<T>();
            }

            throw new HttpResponseException(HttpStatusCode.Forbidden);
        }


        private static IQueryable<Realm> Filter(Principal principal, IContext db, IQueryable<Realm> source, string action)
        {
            if (principal.Roles.Any(item => item.Name == "BD.MedView.Web.Super" || item.Name == "BD.MedView.Web.Admin"))
            {
                var all = db.Realms.ToList();
                var ids = GetAvailableIds(principal, all);
                return source.Where(item => ids.Contains(item.Id) && item.ParentId != null);
            }

            throw new HttpResponseException(HttpStatusCode.Forbidden);
        }

        private static List<int> GetAvailableIds(Principal principal, List<Realm> all, bool inherit = false, Realm realm = null)
        {
            if (realm == null)
            {
                realm = all.First(item => item.ParentId == null);
            }

            var ret = new List<int> { };
            inherit = inherit || principal.Roles
                .Where(item => item.Name == "BD.MedView.Web.Super" || item.Name == "BD.MedView.Web.Admin")
                .Any(item => item.RealmId == realm.Id);
            if (inherit)
            {
                ret.Add(realm.Id);
            }
            foreach (var subRealm in all.Where(item => item.ParentId == realm.Id).ToList())
            {
                ret.AddRange(GetAvailableIds(principal, all, inherit, subRealm));
            }

            return ret;
        }

        private static IQueryable<Role> Filter(Principal principal, IContext db, IQueryable<Role> source, string action)
        {
            if (principal.Roles.Any(item => item.Name == "BD.MedView.Web.Super" && item.Realm.ParentId == null))
            {
                var availableRoles = new[] { "BD.MedView.Web.Super", "BD.MedView.Web.Admin", "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                return source.Where(item => item.Name == "BD.MedView.Web.Super" || (availableRoles.Contains(item.Name) && item.Realm.ParentId != null));
            }

            if (principal.Roles.Any(item => item.Name == "BD.MedView.Web.Admin" && item.Realm.ParentId != null))
            {
                var availableRoles = new[] { "BD.MedView.Web.Clinician", "BD.MedView.Web.Pharmacist", "BD.MedView.Web.ClinicalPharmacist", "BD.MedView.Web.Technician" };
                var ret = null as IQueryable<Role>;
                foreach (var role in principal.Roles.Where(item => item.Name == "BD.MedView.Web.Admin" && item.Realm.ParentId != null))
                {
                    ret = (ret == null)
                        ? source.Where(item => item.RealmId == role.RealmId && item.Realm.ParentId != null)
                        : ret.Union(source.Where(item => item.RealmId == role.RealmId && item.Realm.ParentId != null));
                }
                return ret.Where(item => availableRoles.Contains(item.Name));
            }

            throw new HttpResponseException(HttpStatusCode.Forbidden);
        }

        private static IQueryable<Principal> Filter(Principal principal, IContext db, IQueryable<Principal> source, string action)
        {
            if (principal.Roles.Any(item => item.Name == "BD.MedView.Web.Super" && item.Realm.ParentId == null))
            {
                return source.Where(item => item.Name != "BD.MedView.Authorization.System");
            }

            if (principal.Roles.Any(item => item.Name == "BD.MedView.Web.Admin" && item.Realm.ParentId != null))
            {
                var avaliableActions = new[] { "Select", "Read", "Create" };
                if (!avaliableActions.Contains(action))
                {
                    throw new HttpResponseException(HttpStatusCode.Forbidden);
                }
                return source.Where(item => item.Name != "BD.MedView.Authorization.System");
            }

            throw new HttpResponseException(HttpStatusCode.Forbidden);
        }

        public static void CheckSuper(this ApiController obj, IContext db)
        {
            var identity = obj.User.Identity as ClaimsIdentity;
            //check if principal is registered in the system
            if (identity == null)
            {
                if (obj?.User?.Identity != null && obj.User.Identity.IsAuthenticated)
                {
                    throw new HttpResponseException(HttpStatusCode.Forbidden);
                }

                throw new HttpResponseException(HttpStatusCode.Unauthorized);
            }

            var principal = db.Principals
               .Include(item => item.Roles.Select(r => r.Realm))
               .FirstOrDefault(item => item.Name == obj.User.Identity.Name);
            if (principal == null)
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }

            if (!principal.Roles.Any(item => item.Name == "BD.MedView.Web.Super" && item.Realm.ParentId == null))
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }
        }
    }
}