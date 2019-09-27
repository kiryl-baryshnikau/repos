using BD.MedView.Facility;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Reflection;
using Common.Logging;
using BD.MedView.Services.Extensions;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public interface ISynonymsService: IObservable<EntityEvent<Synonym>>
    {
        IQueryable<Synonym> Select(string expand = null);
        void Create(Synonym value);
        Synonym Read(int id, string expand = null);
        void Update(int id, Synonym value);
        void Delete(int id);
    }

    public class SynonymsService : ISynonymsService
    {
        private readonly ILog log;
        private readonly Facility.IContext context;
        private readonly IEntityEmitter<Synonym> emitter;
        private readonly IEntitySecurity<Synonym> security;

        public SynonymsService(
            ILog log,
            Facility.IContext context,
            IEntityEmitter<Synonym> emitter,
            IEntitySecurity<Synonym> security
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.security = security;
        }

        public IQueryable<Synonym> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(Synonym)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<Synonym>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.Synonyms
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

                var values = null as IQueryable<Synonym>;
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

                log.Info(m => m($"Selected {nameof(Synonym)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(Synonym value)
        {
            using (log.Activity(m => m($"Creating {nameof(Synonym)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as Synonym;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.Synonyms.Add(value);
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

                log.Info(m => m($"Created {nameof(Synonym)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public Synonym Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(Synonym)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Synonym;
                using (log.Activity(m => m($"Read {nameof(Synonym)}[{id}]")))
                {
                    entity = context.Synonyms
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Synonym)}[{id}] is not found");
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

                var value = null as Synonym;
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

                log.Info(m => m($"Read {nameof(Synonym)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, Synonym value)
        {
            using (log.Activity(m => m($"Update {nameof(Synonym)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(Synonym)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as Synonym;
                using (log.Activity(m => m($"Read {nameof(Synonym)}[{id}]")))
                {
                    entity = context.Synonyms.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Synonym)}[{id}] is not found");
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
                        entity.Key = value.Key;
                        entity.ProviderId = value.ProviderId;
                        entity.ElementId = value.ElementId;
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

                log.Info(l => l($"Updated {nameof(Synonym)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(Synonym)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as Synonym;
                using (log.Activity(m => m($"Read {nameof(Synonym)}[{id}]")))
                {
                    entity = context.Synonyms.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(Synonym)}[{id}] is not found");
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
                        context.Synonyms.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(Synonym)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }

        }

        public IDisposable Subscribe(IObserver<EntityEvent<Synonym>> observer)
        {
            return emitter.Subscribe(observer);
        }
    }
}