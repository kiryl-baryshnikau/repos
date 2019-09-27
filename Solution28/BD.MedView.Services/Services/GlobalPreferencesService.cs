using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Linq;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading;
using BD.MedView.Configuration;
using BD.MedView.Services.Extensions;
using BD.MedView.Services.Utilities;
using Common.Logging;
using Microsoft.Extensions.Options;

namespace BD.MedView.Services.Services
{
    #region Interface
    public interface IGlobalPreferencesService
    {
        IQueryable<GlobalPreference> Select(string expand = null);
        GlobalPreference Read(int id, string expand = null);
        GlobalPreference Read(string key, string expand = null);
        InfusionGlobalPreference InfusionPreference { get; set; }
        GlobalPreference Default(string key);
    }
    #endregion Interface

    #region Options
    public class GlobalPreferencesServiceOptions
    {
        public int DefatultContainerTolerance { get; set; }
        public int DefaultPreserveRecords { get; set; }
        public int DefaultPriorityThreshold { get; set; }
        public int DefaultWarningThreshold { get; set; }
        public int DefaultUrgentThreshold { get; set; }
        public int DefaultRefreshRate { get; set; }
        public int DefaultOrderServiceVariance { get; set; }
    }
    #endregion Interface

    #region Implementation
    public class GlobalPreferencesService : IGlobalPreferencesService, IObservable<EntityEvent<GlobalPreference>>
    {
        private readonly IOptions<GlobalPreferencesServiceOptions> options;
        private readonly ILog log;
        private readonly IContext context;
        private readonly IEntityEmitter<GlobalPreference> emitter;
        private readonly IEntitySecurity<GlobalPreference> security;
        private const string InfusionName = "Infusion";

        public GlobalPreferencesService(
            IOptions<GlobalPreferencesServiceOptions> options,
            ILog log, 
            IContext context, 
            IEntityEmitter<GlobalPreference> emitter, 
            IEntitySecurity<GlobalPreference> security)
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.security = security;
            this.options = options;
        }

        public IQueryable<GlobalPreference> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(GlobalPreference)} with expand[{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<GlobalPreference>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.GlobalPreferences
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

                var values = null as IQueryable<GlobalPreference>;
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

                log.Info(m => m($"Selected {nameof(GlobalPreference)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(InfusionGlobalPreference value)
        {
            using (log.Activity(m => m($"Creating {nameof(InfusionGlobalPreference)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as GlobalPreference;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.GlobalPreferences.Add(value);
                        context.SaveChanges();
                    }
                    catch (Exception e) when (e.HasDuplicateKeyNumber())
                    {
                        log.Warn($"Duplicate {nameof(InfusionGlobalPreference.Name)}:\"{value.Name}\"", e);
                        throw new DuplicateKeyException(value.Name);
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

                log.Info(m => m($"Created {nameof(InfusionGlobalPreference)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public GlobalPreference Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(GlobalPreference)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as GlobalPreference;
                using (log.Activity(m => m($"Read {nameof(GlobalPreference)}[{id}]")))
                {
                    entity = context.GlobalPreferences
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(GlobalPreference)}[{id}] is not found");
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

                var value = null as GlobalPreference;
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

                log.Info(m => m($"Read {nameof(GlobalPreference)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public GlobalPreference Read(string key, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(GlobalPreference)}[{key}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as GlobalPreference;
                using (log.Activity(m => m($"Read {nameof(GlobalPreference)}[{key}]")))
                {
                    entity = context.GlobalPreferences
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Name == key);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(GlobalPreference)}[{key}] is not found");
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

                var value = null as GlobalPreference;
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


                log.Info(m => m($"Read {nameof(GlobalPreference)}[{key}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(string key, InfusionGlobalPreference value)
        {
            using (log.Activity(m => m($"Update {nameof(InfusionGlobalPreference)}[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (key != value.Name)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update unique key {nameof(InfusionGlobalPreference)}[{key}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as InfusionGlobalPreference;
                using (log.Activity(m => m($"Read {nameof(InfusionGlobalPreference)}[{key}]")))
                {
                    entity = context.GlobalPreferences.OfType<InfusionGlobalPreference>().SingleOrDefault(item => item.Name == key);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(GlobalPreference)}[{key}] is not found");
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
                        //TODO: KB: Do entity by Entity
                        entity.Configurations = value.Configurations;
                        context.SaveChanges();
                    }
                    catch (Exception e) when (e.HasDuplicateKeyNumber())
                    {
                        log.Warn($"Duplicate {nameof(InfusionGlobalPreference.Name)}:\"{value.Name}\"", e);
                        throw new DuplicateKeyException(value.Name);
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

                log.Info(l => l($"Updated {nameof(InfusionGlobalPreference)}[{key}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public InfusionGlobalPreference InfusionPreference
        {
            get
            {
                if (context.GlobalPreferences.Any(item => item.Name == InfusionName))
                {
                    return this.Read(InfusionName, null) as InfusionGlobalPreference;
                }
                else
                {
                    //TODO: KB: Remove: impossible case 
                    return Default(InfusionName) as InfusionGlobalPreference;
                }
            }
            set
            {
                if (context.GlobalPreferences.Any(item => item.Name == InfusionName))
                {
                    this.Update(InfusionName, value);
                }
                else
                {
                    //TODO: KB: Remove: impossible case 
                    this.Create(value);
                }
            }
        }

        public GlobalPreference Default(string key)
        {
            switch (key)
            {
                case InfusionName:
                    return new InfusionGlobalPreference
                    {
                        Name = InfusionName,
                        Type = "Provider",
                        Version = "1-0-0",
                        ContainerTolerance = options.Value.DefatultContainerTolerance,
                        PreserveRecords = options.Value.DefaultPreserveRecords,
                        PriorityThreshold = options.Value.DefaultPriorityThreshold,
                        WarningThreshold = options.Value.DefaultWarningThreshold,
                        UrgentThreshold = options.Value.DefaultUrgentThreshold,
                        RefreshRate = options.Value.DefaultRefreshRate,
                        OrderServiceVariance = options.Value.DefaultOrderServiceVariance,
                    };
                default: throw new NotImplementedException();
            }

        }

        public IDisposable Subscribe(IObserver<EntityEvent<GlobalPreference>> observer)
        {
            return emitter.Subscribe(observer);
        }

    }
    #endregion Interface
}
