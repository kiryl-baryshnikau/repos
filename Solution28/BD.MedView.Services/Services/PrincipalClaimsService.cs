using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

using Common.Logging;

using BD.MedView.Authorization;
using BD.MedView.Services.Extensions;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public interface IPrincipalClaimsService : IObservable<EntityEvent<PrincipalClaim>>
    {
        IQueryable<PrincipalClaim> Select(string expand = null);
        void Create(PrincipalClaim value);
        PrincipalClaim Read(int id, string expand = null);
        void Update(int id, PrincipalClaim value);
        void Delete(int id);
    }

    public class PrincipalClaimsService : IPrincipalClaimsService
    {
        private readonly ILog log;
        private readonly IContext context;
        private readonly IEntityEmitter<PrincipalClaim> emitter;
        private readonly IEntitySecurity<PrincipalClaim> security;

        public PrincipalClaimsService(
            ILog log,
            IContext context,
            IEntityEmitter<PrincipalClaim> emitter,
            IEntitySecurity<PrincipalClaim> security
            )
        {
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.security = security;
        }

        public IQueryable<PrincipalClaim> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(PrincipalClaim)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<PrincipalClaim>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.PrincipalClaims
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

                var values = null as IQueryable<PrincipalClaim>;
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

        public void Create(PrincipalClaim value)
        {
            using (log.Activity(m => m($"Creating {nameof(PrincipalClaim)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
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

                var entity = null as PrincipalClaim;
                using (log.Activity(m => m("Create Entity")))
                {
                    try
                    {
                        entity = context.PrincipalClaims.Add(value);
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

                log.Info(m => m($"Created {nameof(PrincipalClaim)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public PrincipalClaim Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(PrincipalClaim)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as PrincipalClaim;
                using (log.Activity(m => m($"Read {nameof(PrincipalClaim)}[{id}]")))
                {
                    entity = context.PrincipalClaims
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(PrincipalClaim)}[{id}] is not found");
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

                var value = null as PrincipalClaim;
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

                log.Info(m => m($"Read {nameof(PrincipalClaim)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }

        public void Update(int id, PrincipalClaim value)
        {
            using (log.Activity(m => m($"Update {nameof(PrincipalClaim)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Validate {nameof(value)}")))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.Warn(l => l($"Cannot update primary key {nameof(PrincipalClaim)}[{id}]"));
                        throw new NotSupportedException();
                    }
                }

                var entity = null as PrincipalClaim;
                using (log.Activity(m => m($"Read {nameof(PrincipalClaim)}[{id}]")))
                {
                    entity = context.PrincipalClaims.Include(item => item.Principal).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(PrincipalClaim)}[{id}] is not found");
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
                        entity.Issuer = value.Issuer;
                        entity.OriginalIssuer = value.OriginalIssuer;
                        entity.Subject = value.Subject;
                        entity.Type = value.Type;
                        entity.Value = value.Value;
                        entity.ValueType = value.ValueType;
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

                log.Info(l => l($"Updated {nameof(PrincipalClaim)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public void Delete(int id)
        {
            using (log.Activity(m => m($"Delete {nameof(PrincipalClaim)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as PrincipalClaim;
                using (log.Activity(m => m($"Read {nameof(PrincipalClaim)}[{id}]")))
                {
                    entity = context.PrincipalClaims.Include(item => item.Principal).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(PrincipalClaim)}[{id}] is not found");
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
                        context.PrincipalClaims.Remove(entity);
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

                log.Info(m => m($"Deleted {nameof(PrincipalClaim)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        public IDisposable Subscribe(IObserver<EntityEvent<PrincipalClaim>> observer)
        {
            return emitter.Subscribe(observer);
        }
    }
}