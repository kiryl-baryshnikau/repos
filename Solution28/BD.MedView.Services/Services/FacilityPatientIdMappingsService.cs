using BD.MedView.Configuration;
using BD.MedView.Services.Extensions;
using Common.Logging;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public interface IFacilityPatientIdMappingsService
    {
        IQueryable<FacilityPatientIdMapping> Select(string expand = null);
        FacilityPatientIdMapping Read(int id, string expand = null);
    }

    public class FacilityPatientIdMappingsService : IFacilityPatientIdMappingsService
    {
        private readonly ILog log;
        private readonly IContext context;
        private readonly IEntitySecurity<FacilityPatientIdMapping> security;

        public FacilityPatientIdMappingsService(
            ILog log,
            IContext context,
            IEntitySecurity<FacilityPatientIdMapping> security
            )
        {
            this.log = log;
            this.context = context;
            this.security = security;
        }

        public IQueryable<FacilityPatientIdMapping> Select(string expand = null)
        {
            using (log.Activity(m => m($"Selecting {nameof(FacilityPatientIdMapping)} with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entities = null as IQueryable<FacilityPatientIdMapping>;
                using (log.Activity(m => m("Create Query")))
                {
                    entities = context.FacilityPatientIdMappings
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

                var values = null as IQueryable<FacilityPatientIdMapping>;
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

                log.Info(m => m($"Selected {nameof(FacilityPatientIdMapping)}[{string.Join(",", values.Select(item => item.Id))}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return values;
            }
        }

        public FacilityPatientIdMapping Read(int id, string expand = null)
        {
            using (log.Activity(m => m($"Reading {nameof(FacilityPatientIdMapping)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var entity = null as FacilityPatientIdMapping;
                using (log.Activity(m => m($"Read {nameof(FacilityPatientIdMapping)}[{id}]")))
                {
                    entity = context.FacilityPatientIdMappings
                                       .AsNoTracking()
                                       .Expand(expand)
                                       .SingleOrDefault(item => item.Id == id);
                    if (entity == null)
                    {
                        log.Warn($"{nameof(FacilityPatientIdMapping)}[{id}] is not found");
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

                var value = null as FacilityPatientIdMapping;
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

                log.Info(m => m($"Read {nameof(FacilityPatientIdMapping)}[{id}] with [{expand}] by {Thread.CurrentPrincipal?.Identity?.Name}"));
                return value;
            }
        }
    }
}