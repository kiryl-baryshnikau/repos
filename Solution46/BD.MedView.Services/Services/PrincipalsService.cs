using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using Microsoft.Extensions.Logging;
using BD.MedView.Authorization;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public interface IPrincipalsService
    {
        IQueryable<Principal> Select(string expand = null);
        void Create(Principal value);
        Principal Read(int id, string expand = null);
        void Update(int id, Principal value);
        Principal Delete(int id);
    }

    public class PrincipalsService : IPrincipalsService
    {
        private readonly ILogger<PrincipalsService> log;
        private readonly IContext context;

        public PrincipalsService(
            ILogger<PrincipalsService> log,
            IContext context
            )
        {
            this.log = log;
            this.context = context;
        }

        public IQueryable<Principal> Select(string expand = null)
        {
            using (log.BeginScope($"Selecting {nameof(Principal)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                var entities = null as IQueryable<Principal>;
                using (log.BeginScope("Create Query"))
                {
                    entities = context.Principals
                        .AsNoTracking()
                        .Expand(expand);
                }

                var values = null as IQueryable<Principal>;
                using (log.BeginScope("Filtering"))
                {
                    try
                    {
                        values = entities.Filters(expand).AsQueryable();
                    }
                    catch (Exception e)
                    {
                        log.LogError($"Filtering Error", e);
                        throw;
                    }
                }

                log.LogInformation($"Selected {nameof(Principal)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}");
                return values;
            }
        }

        public void Create(Principal value)
        {
            using (log.BeginScope($"Creating {nameof(Principal)} by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                var entity = null as Principal;
                using (log.BeginScope("Create Entity"))
                {
                    try
                    {
                        entity = context.Principals.Add(value);
                        context.SaveChanges();
                    }
                    //TODO: KB: Do this on index validation
                    //throw new ArgumentException(value.Name)
                    catch (Exception e)
                    {
                        log.LogError($"Update Error", e);
                        throw;
                    }
                }
                var newValue = entity.Filter();

                log.LogInformation($"Created {nameof(Principal)}[{entity.Id}] by {Thread.CurrentPrincipal?.Identity?.Name}");
            }
        }

        public Principal Read(int id, string expand = null)
        {
            using (log.BeginScope($"Reading {nameof(Principal)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                var entity = null as Principal;
                using (log.BeginScope($"Read {nameof(Principal)}[{id}]"))
                {
                    entity = context.Principals
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.LogWarning($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                var value = null as Principal;
                using (log.BeginScope("Filtering"))
                {
                    try
                    {
                        value = entity.Filter(expand);
                    }
                    catch (Exception e)
                    {
                        log.LogError($"Filtering Error", e);
                        throw;
                    }
                }

                log.LogInformation($"Read {nameof(Principal)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}");
                return value;
            }
        }

        public void Update(int id, Principal value)
        {
            using (log.BeginScope($"Update {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                using (log.BeginScope($"Validate {nameof(value)}"))
                {
                    if (id != value.Id)
                    {
                        //Cannot change primary key
                        log.LogWarning($"Cannot update primary key {nameof(Principal)}[{id}]");
                        throw new NotSupportedException();
                    }
                }

                var entity = null as Principal;
                using (log.BeginScope($"Read {nameof(Principal)}[{id}]"))
                {
                    entity = context.Principals.Include(item => item.Roles).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.LogWarning($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                var oldValue = entity.Filter();
                using (log.BeginScope("Update Entity"))
                {
                    try
                    {
                        entity.Name = value.Name;
                        context.SaveChanges();
                    }
                    //TODO: KB: Do this on index validation
                    //throw new ArgumentException(value.Name)
                    catch (Exception e)
                    {
                        log.LogError($"Update Error", e);
                        throw;
                    }
                }
                var newValue = entity.Filter();

                log.LogInformation($"Updated {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}");
            }
        }

        public Principal Delete(int id)
        {
            using (log.BeginScope($"Delete {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                var entity = null as Principal;
                using (log.BeginScope($"Read {nameof(Principal)}[{id}]"))
                {
                    entity = context.Principals.Include(item => item.Roles).SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.LogWarning($"{nameof(Principal)}[{id}] is not found");
                        throw new KeyNotFoundException();
                    }
                }

                var oldValue = entity.Filter();
                using (log.BeginScope("Delete Entity"))
                {
                    try
                    {
                        context.Principals.Remove(entity);
                        context.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        log.LogError($"Update Error", e);
                        throw;
                    }
                }

                log.LogInformation($"Deleted {nameof(Principal)}[{id}] by {Thread.CurrentPrincipal?.Identity?.Name}");

                return oldValue;
            }
        }
    }
}