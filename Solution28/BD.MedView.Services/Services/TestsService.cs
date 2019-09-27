using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using Common.Logging;
using BD.MedView.Services.Extensions;
using System.Threading;

namespace BD.MedView.Services.Services
{
    public interface ITestsService
    {
        IQueryable<Facility.Facility> Select(string expand = null);
    }

    public class TestsService : ITestsService//, IObservable<EntityEvent<Facility.Facility>>
    {
        private readonly ILog log;
        private readonly Facility.IContext context;
        //private readonly IEntityEmitter<Facility.Facility> emitter;
        private readonly IEntitySecurity<Facility.Facility> security;

        public TestsService(
            ILog log,
            Facility.IContext context//,
            //IEntityEmitter<Facility.Facility> emitter,
            //IEntitySecurity<Facility.Facility> security
            )
        {
            this.log = log;
            this.context = context;
            //this.emitter = emitter;
            //this.security = security;
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
                    //entities = new List<Facility.Facility> { new Facility.Facility { Id = 1, Name = "Name 1" }, new Facility.Facility { Id = 2, Name = "Name 2" } }.AsQueryable();
                }

                using (log.Activity(m => m("Authorization")))
                {
                    try
                    {
                        //entities = security.ValidateSelect(entities, expand);
                        entities = entities;
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
    }
}