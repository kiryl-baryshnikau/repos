using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using Common.Logging;
using BD.MedView.Services.Extensions;
using System.Threading;
using BD.MedView.Runtime;
using System.Data.Entity.Core;
using System.Data.SqlClient;
using System.Data.Linq;
using System.Data.Entity.Infrastructure;

namespace BD.MedView.Services.Services
{
    public interface ILastActiveRoutesService : IObservable<EntityEvent<LastActiveRoute>>
    {
        IQueryable<LastActiveRoute> Select(string expand = null, string filter = null);
        void Create(LastActiveRoute value);
        LastActiveRoute Read(int id, string expand = null);
        void Update(int id, LastActiveRoute value);
        void Delete(int id);
    }

    public class LastActiveRoutesService : ILastActiveRoutesService
    {
        private readonly ILog log;
        private readonly IContext context;
        private readonly IEntityEmitter<LastActiveRoute> emitter;

        private readonly IEntitySecurity<LastActiveRoute> security;

        public LastActiveRoutesService(
            ILog log,
            IContext context,
            IEntityEmitter<LastActiveRoute> emitter,
            IEntitySecurity<LastActiveRoute> security
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.security = security;
        }

        public IQueryable<LastActiveRoute> Select(string expand = null, string filter = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(LastActiveRoute)} with expand[{expand}] and filter[{filter}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<LastActiveRoute>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.LastActiveRoutes
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

                var values = null as IQueryable<LastActiveRoute>;
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

                log.Info(m => m($"Selected {nameof(LastActiveRoute)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(LastActiveRoute value)
        {
            using (log.Activity(m => m($"Creating {nameof(LastActiveRoute)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as LastActiveRoute;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.LastActiveRoutes.Add(value);
                        context.SaveChanges();
                    }
                    catch (Exception e) when (e.HasDuplicateKeyNumber())
                    {
                        log.Warn($"Duplicate {nameof(LastActiveRoute.User)}:\"{value.User}\"", e);
                        throw new DuplicateKeyException(value.User);
                    }
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

                log.Info(m => m($"Created {nameof(LastActiveRoute)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public LastActiveRoute Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(LastActiveRoute)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as LastActiveRoute;
                using (log.Activity(m => m($"Read {nameof(LastActiveRoute)}[{id}]")))
                {
                    entity = context.LastActiveRoutes
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(LastActiveRoute)}[{id}] is not found");
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

                var value = null as LastActiveRoute;
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

                log.Info(m => m($"Read {nameof(LastActiveRoute)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, LastActiveRoute value)
        {
            using (log.Activity(m => m($"Update {nameof(LastActiveRoute)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(LastActiveRoute)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as LastActiveRoute;
                using (log.Activity(m => m($"Read {nameof(LastActiveRoute)}[{id}]")))
                {
                    entity = context.LastActiveRoutes.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(LastActiveRoute)}[{id}] is not found");
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
                        entity.User = value.User;
                        entity.Value = value.Value;
                        context.SaveChanges();
                    }
                    catch (Exception e) when (e.HasDuplicateKeyNumber())
                    {
                        log.Warn($"Duplicate {nameof(LastActiveRoute.User)}:\"{value.User}\"", e);
                        throw new DuplicateKeyException(value.User);
                    }
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

                log.Info(l => l($"Updated {nameof(LastActiveRoute)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(LastActiveRoute)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as LastActiveRoute;
                using (log.Activity(m => m($"Read {nameof(LastActiveRoute)}[{id}]")))
                {
                    entity = context.LastActiveRoutes.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(LastActiveRoute)}[{id}] is not found");
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
                        context.LastActiveRoutes.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(LastActiveRoute)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public IDisposable Subscribe(IObserver<EntityEvent<LastActiveRoute>> observer)
        {
            return emitter.Subscribe(observer);
        }
    }
}