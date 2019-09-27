using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Reflection;

using Common.Logging;

using BD.MedView.Authorization;
using BD.MedView.Services.Extensions;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public interface IPrincipalsService: IObservable<EntityEvent<Principal>>, IObservable<EntityLinkEvent<Principal, Role>>
    {
        IQueryable<Principal> Select(string expand = null);
        void Create(Principal value);
        Principal Read(int id, string expand = null);
        void Update(int id, Principal value);
        void Delete(int id);

        void AddRole(int id, int link);
        void RemoveRole(int id, int link);
    }

    public class PrincipalsService : IPrincipalsService
    {
        private readonly ILog log;
        private readonly IContext context;
        private readonly IEntityEmitter<Principal> emitter;
        private readonly IEntityLinkEmitter<Principal, Role> linkEmitter;
        private readonly IEntitySecurity<Principal> security;
        private readonly IEntityLinkSecurity<Principal, Role> linkSecurity;

        public PrincipalsService(
            ILog log,
            IContext context,
            IEntityEmitter<Principal> emitter,
            IEntityLinkEmitter<Principal, Role> linkEmitter,
            IEntitySecurity<Principal> security,
            IEntityLinkSecurity<Principal, Role> linkSecurity
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.linkEmitter = linkEmitter;
            this.security = security;
            this.linkSecurity = linkSecurity;
        }

        public IQueryable<Principal> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(Principal)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<Principal>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.Principals
                        .AsNoTracking()
                        .Expand(expand);
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

                var values = null as IQueryable<Principal>;
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

                log.Info(m => m($"Selected {nameof(Principal)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(Principal value)
        {
            using (log.Activity(m => m($"Creating {nameof(Principal)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        security.ValidateCreate(value);
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

                var entity = null as Principal;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.Principals.Add(value);
                        context.SaveChanges();
                    }
                    //TODO: KB: Do this on index validation
                    //throw new DuplicateKeyException(value.Name)
                    catch (Exception e)
                    {
                        log.Error($"Update Error", e);
                        throw;
                    }
                }
                var newValue = entity.Filter();

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        emitter.OnCreated(newValue);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info(m => m($"Created {nameof(Principal)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public Principal Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(Principal)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Principal;
                using (log.Activity(m => m($"Read {nameof(Principal)}[{id}]")))
                {
                    entity = context.Principals
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        security.ValidateRead(entity, expand);
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

                var value = null as Principal;
                using (log.Activity(m => m("Filtering")))
                {
                    try
                    {
                        value = entity.Filter(expand);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Filtering Error", e);
                        throw;
                    }
                }

                log.Info(m => m($"Read {nameof(Principal)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, Principal value)
        {
            using (log.Activity(m => m($"Update {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(Principal)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as Principal;
                using (log.Activity(m => m($"Read {nameof(Principal)}[{id}]")))
                {
                    entity = context.Principals.Include(item => item.Roles).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        security.ValidateUpdate(entity, value);
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

                var oldValue = entity.Filter();
                using (log.Activity(m => m("Update Entity")))
                {
                    try
                    {
                        entity.Name = value.Name;
                        context.SaveChanges();
                    }
                    //TODO: KB: Do this on index validation
                    //throw new DuplicateKeyException(value.Name)
                    catch (Exception e)
                    {
                        log.Error($"Update Error", e);
                        throw;
                    }
                }
                var newValue = entity.Filter();

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        emitter.OnUpdated(newValue, oldValue);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info(l => l($"Updated {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Principal;
                using (log.Activity(m => m($"Read {nameof(Principal)}[{id}]")))
                {
                    entity = context.Principals.Include(item => item.Roles).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        security.ValidateDelete(entity);
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

                var oldValue = entity.Filter();
                using (log.Activity(m => m("Delete Entity")))
                {
                    try
                    {
                        context.Principals.Remove(entity);
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        log.Error($"Update Error", e);
                        throw;
                    }
                }

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        emitter.OnDeleted(oldValue);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info(m => m($"Deleted {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void AddRole(int id, int link)
        {
            using (log.Activity(m => m($"Add {nameof(Role)}[{link}] to {nameof(Principal)}[{id}].{nameof(Principal.Roles)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Principal;
                using (log.Activity(m => m($"Read {nameof(Principal)}[{id}]")))
                {
                    entity = context.Principals.Include(item => item.Roles.Select(r => r.Realm)).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                var relation = null as Role;
                using (log.Activity(m => m($"Read {nameof(Role)}[{link}]")))
                {
                    relation = context.Roles.Include(item => item.Realm).SingleOrDefault(item => item.Id == link);
                    if (relation == null)
                    {
                        log.Warn($"{nameof(Role)}[{link}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        linkSecurity.ValidateAdd(entity, relation, item => item.Roles);
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

                using (log.Activity(m => m("Update Entity")))
                {
                    try
                    {
                        entity.Roles.Add(relation);
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        log.Error($"Update Error", e);
                        throw;
                    }
                }

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        var leftValue = entity.Filter();
                        var rightValue = relation.Filter();
                        linkEmitter.OnAdded(leftValue, rightValue, item => item.Roles);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info($"Added {nameof(Role)}[{link}] to {nameof(Principal)}[{id}].{nameof(Principal.Roles)} by {Thread.CurrentPrincipal?.Identity?.Name}");
            }
        }

        public void RemoveRole(int id, int link)
        {
            using (log.Activity(m => m($"Remove {nameof(Role)}[{link}] from {nameof(Principal)}[{id}].{nameof(Principal.Roles)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Principal;
                using (log.Activity(m => m($"Read {nameof(Principal)}[{id}]")))
                {
                    entity = context.Principals.Include(item => item.Roles.Select(r => r.Realm)).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                var relation = null as Role;
                using (log.Activity(m => m($"Read {nameof(Role)}[{link}]")))
                {
                    relation = context.Roles.Include(item => item.Realm).SingleOrDefault(item => item.Id == link);
                    if (relation == null)
                    {
                        log.Warn($"{nameof(Role)}[{link}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        linkSecurity.ValidateRemove(entity, relation, item => item.Roles);
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

                using (log.Activity(m => m("Update Entity")))
                {
                    try
                    {
                        entity.Roles.Remove(relation);
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        log.Error($"Update Error", e);
                        throw;
                    }
                }

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        var leftValue = entity.Filter();
                        var rightValue = relation.Filter();
                        linkEmitter.OnRemoved(leftValue, rightValue, item => item.Roles);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info($"Removed {nameof(Role)}[{link}] from {nameof(Principal)}[{id}].{nameof(Principal.Roles)} by {Thread.CurrentPrincipal?.Identity?.Name}");
            }
        }

        public IDisposable Subscribe(IObserver<EntityEvent<Principal>> observer)
        {
            return emitter.Subscribe(observer);
        }

        public IDisposable Subscribe(IObserver<EntityLinkEvent<Principal, Role>> observer)
        {
            return linkEmitter.Subscribe(observer);
        }
    }
}