using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using Common.Logging;
using BD.MedView.Services.Extensions;
using System.Threading;
using BD.MedView.Runtime;
using System.Data.SqlClient;
using System.Data.Linq;

namespace BD.MedView.Services.Services
{
    public interface IAttentionNoticeStatusesService : IObservable<EntityEvent<AttentionNoticeStatus>>, IObservable<EntityAccessEvent<AttentionNoticeStatus>>
    {
        IQueryable<AttentionNoticeStatus> Select(string expand = null, string filter = null);
        void Create(AttentionNoticeStatus value);
        AttentionNoticeStatus Read(int id, string expand = null);
        AttentionNoticeStatus Read(string key, string expand = null);
        void Update(int id, AttentionNoticeStatus value);
        void Update(string key, AttentionNoticeStatus value);
        void Delete(int id);
        void Delete(string key);
    }

    public class AttentionNoticeStatusesService : IAttentionNoticeStatusesService
    {
        private readonly ILog log;
        private readonly IContext context;
        private readonly IEntityEmitter<AttentionNoticeStatus> emitter;
        private readonly IEntityAccessEmitter<AttentionNoticeStatus> accessEmitter;

        private readonly IEntitySecurity<AttentionNoticeStatus> security;

        

        public AttentionNoticeStatusesService(
            ILog log,
            IContext context,
            IEntityEmitter<AttentionNoticeStatus> emitter,
            IEntityAccessEmitter<AttentionNoticeStatus> accessEmitter,
            IEntitySecurity<AttentionNoticeStatus> security
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.accessEmitter = accessEmitter;
            this.security = security;
        }

        public IQueryable<AttentionNoticeStatus> Select(string expand = null, string filter = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(AttentionNoticeStatus)} with expand[{expand}] and filter[{filter}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<AttentionNoticeStatus>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.AttentionNoticeStatuses
                        .AsNoTracking()
                        .Expand(expand);

                    //TODO: KB: It must be one dynamic linq or odata or typed filter 
                    if (!string.IsNullOrWhiteSpace(filter))
                    {
                        var keys = filter.Split(',').ToList();
                        entities = entities
                            .Where(item => keys.Contains(item.Key));
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

                var values = null as IQueryable<AttentionNoticeStatus>;
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

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        accessEmitter.OnSelected(values.ToList());
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }

                log.Info(m => m($"Selected {nameof(AttentionNoticeStatus)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(AttentionNoticeStatus value)
        {
            using (log.Activity(m => m($"Creating {nameof(AttentionNoticeStatus)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as AttentionNoticeStatus;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.AttentionNoticeStatuses.Add(value);
                        context.SaveChanges();
                    }
                    catch (Exception e) when (e.HasDuplicateKeyNumber())
                    {
                        log.Warn($"Duplicate {nameof(AttentionNoticeStatus.Key)}:\"{value.Key}\"", e);
                        throw new DuplicateKeyException(value.Key);
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

                log.Info(m => m($"Created {nameof(AttentionNoticeStatus)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public AttentionNoticeStatus Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(AttentionNoticeStatus)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as AttentionNoticeStatus;
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatus)}[{id}]")))
                {
                    entity = context.AttentionNoticeStatuses
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(AttentionNoticeStatus)}[{id}] is not found");
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

                var value = null as AttentionNoticeStatus;
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

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        accessEmitter.OnReaded(value);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }


                log.Info(m => m($"Read {nameof(AttentionNoticeStatus)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public AttentionNoticeStatus Read(string key, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(AttentionNoticeStatus)}[{key}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as AttentionNoticeStatus;
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatus)}[{key}]")))
                {
                    entity = context.AttentionNoticeStatuses
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Key == key);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(AttentionNoticeStatus)}[{key}] is not found");
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

                var value = null as AttentionNoticeStatus;
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

                using (log.Activity(m => m("Emit Event")))
                {
                    try
                    {
                        accessEmitter.OnReaded(value);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Emit Event Error", e);
                        throw;
                    }
                }


                log.Info(m => m($"Read {nameof(AttentionNoticeStatus)}[{key}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, AttentionNoticeStatus value)
        {
            using (log.Activity(m => m($"Update {nameof(AttentionNoticeStatus)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(AttentionNoticeStatus)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as AttentionNoticeStatus;
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatus)}[{id}]")))
                {
                    entity = context.AttentionNoticeStatuses.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(AttentionNoticeStatus)}[{id}] is not found");
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
                        entity.Status = value.Status;
                        entity.Key = value.Key;
                        entity.UpdatedBy = value.UpdatedBy;
                        entity.UpdatedDateTime = value.UpdatedDateTime;
                        context.SaveChanges();
                    }
                    catch (Exception e) when (e.HasDuplicateKeyNumber())
                    {
                        log.Warn($"Duplicate {nameof(AttentionNoticeStatus.Key)}:\"{value.Key}\"", e);
                        throw new DuplicateKeyException(value.Key);
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

                log.Info(l => l($"Updated {nameof(AttentionNoticeStatus)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Update(string key, AttentionNoticeStatus value)
        {
            using (log.Activity(m => m($"Update {nameof(AttentionNoticeStatus)}[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (key != value.Key)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update unique key {nameof(AttentionNoticeStatus)}[{key}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as AttentionNoticeStatus;
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatus)}[{key}]")))
                {
                    entity = context.AttentionNoticeStatuses.SingleOrDefault(item => item.Key == key);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(AttentionNoticeStatus)}[{key}] is not found");
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
                        entity.Key = value.Key;
                        entity.FacilityId = value.FacilityId;
                        entity.UpdatedBy = value.UpdatedBy;
                        entity.UpdatedDateTime = value.UpdatedDateTime;
                        context.SaveChanges();
                    }
                    catch (Exception e) when (e.HasDuplicateKeyNumber())
                    {
                        log.Warn($"Duplicate {nameof(AttentionNoticeStatus.Key)}:\"{value.Key}\"", e);
                        throw new DuplicateKeyException(value.Key);
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

                log.Info(l => l($"Updated {nameof(AttentionNoticeStatus)}[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(AttentionNoticeStatus)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as AttentionNoticeStatus;
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatus)}[{id}]")))
                {
                    entity = context.AttentionNoticeStatuses.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(AttentionNoticeStatus)}[{id}] is not found");
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
                        context.AttentionNoticeStatuses.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(AttentionNoticeStatus)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }


        public void Delete(string key)
        {
            using (log.Activity(m => m($"Delete {nameof(AttentionNoticeStatus)}[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as AttentionNoticeStatus;
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatus)}[{key}]")))
                {
                    entity = context.AttentionNoticeStatuses.SingleOrDefault(item => item.Key == key);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(AttentionNoticeStatus)}[{key}] is not found");
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
                        context.AttentionNoticeStatuses.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(AttentionNoticeStatus)}[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public IDisposable Subscribe(IObserver<EntityEvent<AttentionNoticeStatus>> observer)
        {
            return emitter.Subscribe(observer);
        }

        public IDisposable Subscribe(IObserver<EntityAccessEvent<AttentionNoticeStatus>> observer)
        {
            return accessEmitter.Subscribe(observer);
        }
    }
}