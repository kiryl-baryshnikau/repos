using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using Common.Logging;
using BD.MedView.Services.Extensions;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public interface IFacilitiesService
    {
        IQueryable<Facility.Facility> Select(string expand = null);
        void Create(Facility.Facility value);
        Facility.Facility Read(int id, string expand = null);
        void Update(int id, Facility.Facility value);
        void Delete(int id);
    }

    public class FacilitiesService : IFacilitiesService, IObservable<EntityEvent<Facility.Facility>>
    {
        private readonly ILog log;
        private readonly Facility.IContext context;
        private readonly IEntityEmitter<Facility.Facility> emitter;
        private readonly IEntitySecurity<Facility.Facility> security;

        public FacilitiesService(
            ILog log,
            Facility.IContext context,
            IEntityEmitter<Facility.Facility> emitter,
            IEntitySecurity<Facility.Facility> security
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.security = security;
        }

        public IQueryable<Facility.Facility> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(Facility.Facility)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<Facility.Facility>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = this.context.Facilities
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

                var values = null as IQueryable<Facility.Facility>;
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

                log.Info(m => m($"Selected {nameof(Facility.Facility)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(Facility.Facility value)
        {
            using (log.Activity(m => m($"Creating {nameof(Facility.Facility)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as Facility.Facility;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.Facilities.Add(value);
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

                log.Info(m => m($"Created {nameof(Facility.Facility)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public Facility.Facility Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(Facility.Facility)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Facility.Facility;
                using (log.Activity(m => m($"Read {nameof(Facility.Facility)}[{id}]")))
                {
                    entity = context.Facilities
                        .AsNoTracking()
                        .Expand(expand)
                        .SingleOrDefault(item => item.Id == id);

                    if (entity == null)
                    {
                        log.Warn($"{nameof(Facility.Facility)}[{id}] is not found");
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

                var value = null as Facility.Facility;
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

                log.Info(m => m($"Read {nameof(Facility.Facility)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, Facility.Facility value)
        {
            using (log.Activity(m => m($"Update {nameof(Facility.Facility)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(Facility.Facility)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as Facility.Facility;
                using (log.Activity(m => m($"Read {nameof(Facility.Facility)}[{id}]")))
                {
                    entity = context.Facilities.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Facility.Facility)}[{id}] is not found");
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

                log.Info(l => l($"Updated {nameof(Facility.Facility)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }
        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(Facility.Facility)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Facility.Facility;
                using (log.Activity(m => m($"Read {nameof(Facility.Facility)}[{id}]")))
                {
                    entity = context.Facilities.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Facility.Facility)}[{id}] is not found");
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
                        context.Facilities.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(Facility.Facility)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public IDisposable Subscribe(IObserver<EntityEvent<Facility.Facility>> observer)
        {
            return emitter.Subscribe(observer);
        }
    }
}