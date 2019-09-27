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
    public interface IRolesService: IObservable<EntityEvent<Role>>, IObservable<EntityLinkEvent<Role, Principal>>
    {
        IQueryable<Role> Select(string expand = null);
        void Create(Role value);
        Role Read(int id, string expand = null);
        void Update(int id, Role value);
        void Delete(int id);

        void AddPrincipal(int id, int link);
        void RemovePrincipal(int id, int link);
    }

    public class RolesService : IRolesService
    {
        private readonly ILog log;
        private readonly Authorization.IContext context;
        private readonly IEntityEmitter<Role> emitter;
        private readonly IEntityLinkEmitter<Role, Principal> linkEmitter;
        private readonly IEntitySecurity<Role> security;
        private readonly IEntityLinkSecurity<Role, Principal> linkSecurity;

        public RolesService(
            ILog log,
            Authorization.IContext context,
            IEntityEmitter<Role> emitter,
            IEntityLinkEmitter<Role, Principal> linkEmitter,
            IEntitySecurity<Role> security,
            IEntityLinkSecurity<Role, Principal> linkSecurity
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.linkEmitter = linkEmitter;
            this.security = security;
            this.linkSecurity = linkSecurity;
        }

        public IQueryable<Role> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(Role)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<Role>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.Roles
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

                var values = null as IQueryable<Role>;
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

                log.Info(m => m($"Selected {nameof(Role)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(Role value)
        {
            using (log.Activity(m => m($"Creating {nameof(Role)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as Role;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.Roles.Add(value);
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

                log.Info(m => m($"Created {nameof(Role)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public Role Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(Role)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Role;
                using (log.Activity(m => m($"Read {nameof(Role)}[{id}]")))
                {
                    entity = context.Roles
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Role)}[{id}] is not found");
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

                var value = null as Role;
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

                log.Info(m => m($"Read {nameof(Role)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, Role value)
        {
            using (log.Activity(m => m($"Update {nameof(Role)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(Role)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as Role;
                using (log.Activity(m => m($"Read {nameof(Role)}[{id}]")))
                {
                    entity = context.Roles.Include(item => item.Realm).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Role)}[{id}] is not found");
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
                        entity.RealmId = value.RealmId;
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

                log.Info(l => l($"Updated {nameof(Role)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(Role)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Role;
                using (log.Activity(m => m($"Read {nameof(Role)}[{id}]")))
                {
                    entity = context.Roles.Include(item => item.Realm).SingleOrDefault(item => item.Id == id);
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
                        context.Roles.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(Role)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void AddPrincipal(int id, int link)
        {
            using (log.Activity(m => m($"Add {nameof(Principal)}[{link}] to {nameof(Role)}[{id}].{nameof(Role.Principals)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Role;
                using (log.Activity(m => m($"Read {nameof(Role)}[{id}]")))
                {
                    entity = context.Roles.Include(item => item.Realm).Include(item => item.Principals).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Role)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                var relation = null as Principal;
                using (log.Activity(m => m($"Read {nameof(Principal)}[{link}]")))
                {
                    relation = context.Principals.Include(item => item.Roles).SingleOrDefault(item => item.Id == link);
                    if (relation == null)
                    {
                        log.Warn($"{nameof(Principal)}[{link}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        linkSecurity.ValidateAdd(entity, relation, item => item.Principals);
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
                        entity.Principals.Add(relation);
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
                        linkEmitter.OnAdded(leftValue, rightValue, item => item.Principals);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info($"Added {nameof(Principal)}[{link}] to {nameof(Role)}[{id}].{nameof(Role.Principals)} by {Thread.CurrentPrincipal?.Identity?.Name}");
            }
        }

        public void RemovePrincipal(int id, int link)
        {
            using (log.Activity(m => m($"Remove {nameof(Principal)}[{link}] from {nameof(Role)}[{id}].{nameof(Role.Principals)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Role;
                using (log.Activity(m => m($"Read {nameof(Role)}[{id}]")))
                {
                    entity = context.Roles.Include(item => item.Realm).Include(item => item.Principals).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Role)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                var relation = null as Principal;
                using (log.Activity(m => m($"Read {nameof(Principal)}[{link}]")))
                {
                    relation = context.Principals.Include(item => item.Roles).SingleOrDefault(item => item.Id == link);
                    if (relation == null)
                    {
                        log.Warn($"{nameof(Principal)}[{link}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        linkSecurity.ValidateRemove(entity, relation, item => item.Principals);
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
                        entity.Principals.Remove(relation);
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
                        linkEmitter.OnRemoved(leftValue, rightValue, item => item.Principals);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info($"Removed {nameof(Principal)}[{link}] from {nameof(Role)}[{id}].{nameof(Role.Principals)} by {Thread.CurrentPrincipal?.Identity?.Name}");
            }
        }

        public IDisposable Subscribe(IObserver<EntityEvent<Role>> observer)
        {
            return emitter.Subscribe(observer);
        }

        public IDisposable Subscribe(IObserver<EntityLinkEvent<Role, Principal>> observer)
        {
            return linkEmitter.Subscribe(observer);
        }
    }
}