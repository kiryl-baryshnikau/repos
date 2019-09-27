using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading;
using BD.MedView.Configuration;
using BD.MedView.Services.Extensions;
using Common.Logging;

namespace BD.MedView.Services.Services
{
    public interface IUserPreferencesService : IObservable<EntityEvent<UserPreference>>
    {
        IQueryable<UserPreference> Select(string expand = null);

        void Create(UserPreference value);

        UserPreference Read(int id, string expand = null);

        void Update(int id, UserPreference value);

        void Delete(int id);

        void Migrate(MigrateRequest request);
    }

    public class UserPreferencesService : IUserPreferencesService
    {
        internal const string unifiedFacilitySource = "BD.MedView.Facility";
        internal static readonly string allFacilityId = Guid.Empty.ToString("N");


        private readonly ILog log;
        private readonly Configuration.IContext context;
        private readonly IEntityEmitter<UserPreference> emitter;
        private readonly IEntitySecurity<UserPreference> security;

        public static readonly object LockObject = new object();

        public UserPreferencesService(
            ILog log,
            Configuration.IContext context,
            IEntityEmitter<UserPreference> emitter,
            IEntitySecurity<UserPreference> security
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.security = security;
        }


        #region IUserPreferencesService
        public IQueryable<UserPreference> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(UserPreference)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<UserPreference>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.UserPreferences
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

                var values = null as IQueryable<UserPreference>;
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

                log.Info(m => m($"Selected {nameof(UserPreference)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public void Create(UserPreference value)
        {
            using (log.Activity(m => m($"Creating {nameof(UserPreference)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as UserPreference;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.UserPreferences.Add(value);
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

                log.Info(m => m($"Created {nameof(UserPreference)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public UserPreference Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(UserPreference)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as UserPreference;
                using (log.Activity(m => m($"Read {nameof(UserPreference)}[{id}]")))
                {
                    entity = context.UserPreferences
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(UserPreference)}[{id}] is not found");
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

                var value = null as UserPreference;
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

                log.Info(m => m($"Read {nameof(UserPreference)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, UserPreference value)
        {
            using (log.Activity(m => m($"Update {nameof(UserPreference)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(UserPreference)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as UserPreference;
                using (log.Activity(m => m($"Read {nameof(UserPreference)}[{id}]")))
                {
                    entity = context.UserPreferences.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(UserPreference)}[{id}] is not found");
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
                        entity.SessionTimeout = value.SessionTimeout;
                        entity.Configurations = value.Configurations;
                        entity.MaskData = value.MaskData;
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

                log.Info(l => l($"Updated {nameof(UserPreference)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(UserPreference)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as UserPreference;
                using (log.Activity(m => m($"Read {nameof(UserPreference)}[{id}]")))
                {
                    entity = context.UserPreferences.SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(UserPreference)}[{id}] is not found");
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
                        context.UserPreferences.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(UserPreference)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public IDisposable Subscribe(IObserver<EntityEvent<UserPreference>> observer)
        {
            return emitter.Subscribe(observer);
        }

        public void Migrate(MigrateRequest request)
        {
            var user = Thread.CurrentPrincipal?.Identity?.Name;
            log.Info($"{nameof(UserPreference)}[{user}] Starting user migration ...");
            if (user == request.OldPrincipalName)
            {
                log.Warn($"{nameof(UserPreference)}[{user}] Migration action is not required for passed parameters");
                throw new KeyNotFoundException();
            }

            if (string.IsNullOrEmpty(request.NewPrincipalName) ||
                string.IsNullOrEmpty(request.OldPrincipalName) ||
                !request.AppCodes.Any())
            {
                log.Warn($"{nameof(UserPreference)}[{user}] Invalid parameters passed for migration");
                throw new NotSupportedException();
            }
            try
            {
                request.NewPrincipalName = user;

                log.Info($"{nameof(UserPreference)}[{user}] Migrating {request.OldPrincipalName} to {request.NewPrincipalName}");

                context.MigrateAccount(request);

                log.Info($"{nameof(UserPreference)}[{user}] Migration performed successfully");

            }
            catch (Exception e)
            {
                log.Error($"Error on account migration: ", e);
                throw;
            }
        }
        #endregion
    }
}