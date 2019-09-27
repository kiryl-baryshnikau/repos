using System;
using System.Data.Entity;
using System.Linq;
using Common.Logging;
using BD.MedView.Services.Extensions;
using System.Threading;
using BD.MedView.Authorization;

namespace BD.MedView.Services.Services
{
    public interface IAccessesService
    {
        IQueryable<Access> Select(string expand = null, string filter = null);
    }

    public class AccessesService : IAccessesService
    {
        private readonly ILog log;
        private readonly IContext context;

        private readonly IEntityAccessSecurity<Access> security;

        public AccessesService(
            ILog log,
            IContext context,
            IEntityAccessSecurity<Access> security
            )
        {
            this.log = log;
            this.context = context;
            this.security = security;
        }

        public IQueryable<Access> Select(string expand = null, string filter = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(Access)} with expand[{expand}] and filter[{filter}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<Access>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.Accesses
                        .AsNoTracking()
                        .Expand(expand);

                    //TODO: KB: It must be one dynamic linq or odata or typed filter 
                    if (!string.IsNullOrWhiteSpace(filter))
                    {
                        var principalNames = filter.Split(',').ToList();
                        entities = entities
                            .Where(item => principalNames.Contains(item.Principal.Name));
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        entities = security.ValidateSelect(entities, expand);
                    }
                    catch (UnauthorizedAccessException)
                    {
                        log.Warn($"Authorization Denied");
                        throw;
                    }
                    catch (Exception e)
                    {
                        log.Error($"Authorization Error", e);
                        throw;
                    }
                }

                var values = null as IQueryable<Access>;
                using (log.Activity(m => m("Filtering")))
                {
                    try
                    {
                        values = entities.Filters(expand).AsQueryable();
                    }
                    catch (Exception e)
                    {
                        log.Error($"Filtering Error", e);
                        throw;
                    }
                }

                log.Info(m => m($"Selected {nameof(Access)}[{string.Join(",", values.Select(item => $"{item.PrincipalId}|{item.RealmId}|{item.PermissionId}"))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }
    }
}