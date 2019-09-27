using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading;
using BD.MedView.Configuration;
using BD.MedView.Services.Extensions;
using Common.Logging;

namespace BD.MedView.Services.Services
{
    public interface IStateMappingsConfigurationService
    {
        IEnumerable<WidgetState> GetMappings();

        void Create(List<ProviderState> statesRequest);

        void Update(List<ProviderState> statesRequest);

        void Synch(List<ProviderState> states);

        IEnumerable<ProviderState> GetProviderStates();

        void Ensure();

        void SynchDeletedStates(List<ProviderState> states);
    }

    public class StateMappingsConfigurationService : IStateMappingsConfigurationService
    {
        private readonly ILog log;
        private readonly IContext context;

        public StateMappingsConfigurationService(IContext context, ILog log)
        {
            this.context = context;
            this.log = log;
        }

        public IEnumerable<WidgetState> GetMappings()
        {
            using (log.Activity(m => m($"{nameof(GetMappings)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Read {nameof(WidgetState)}")))
                {
                    return context.WidgetStates.Include(x => x.ProviderStates);
                }
            }
        }

        public void Create(List<ProviderState> statesRequest)
        {
            using (log.Activity(m => m($"{nameof(Create)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Write {nameof(ProviderState)}")))
                {
                    foreach (ProviderState state in statesRequest)
                    {
                        var requestWidgetState = state.WidgetStates.FirstOrDefault();
                        if (requestWidgetState == null)
                        {
                            throw new KeyNotFoundException();
                        }
                        var widgetStates = context.WidgetStates.Where(x => x.Type == requestWidgetState.Type);
                        ProviderState newState = new ProviderState()
                        {
                            Designation = state.Designation,
                            StateId = state.StateId,
                            StandardId = state.StandardId,
                            WidgetStates = widgetStates.ToList()
                        };
                        context.ProviderStates.Add(newState);
                    }
                    context.SaveChanges();
                }
            }
        }

        public void Update(List<ProviderState> statesRequest)
        {
            using (log.Activity(m => m($"{nameof(Update)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Update {nameof(WidgetState)}")))
                {

                    var userProviderStateIds = statesRequest.Select(x => x.Id);
                    var userProviderDesignationnIds = statesRequest.Select(x => x.Designation);
                    var currentStates = context.ProviderStates
                        .Where(x => userProviderStateIds.Contains(x.Id) || userProviderDesignationnIds.Contains(x.Designation))
                        .Include(x => x.WidgetStates).ToList();
                    var widgetStates = context.WidgetStates.ToList();


                    foreach (ProviderState updateState in statesRequest)
                    {
                        var providerState = currentStates.FirstOrDefault(x =>
                            x.Id == updateState.Id || x.Designation == updateState.Designation);
                        var widgetStateIds = updateState.WidgetStates.Select(x => x.Type);

                        if (providerState != null)
                        {
                            var states = widgetStates.Where(x => widgetStateIds.Contains(x.Type));
                            providerState.WidgetStates = states.ToList();
                            context.Update(providerState);
                        }
                        else
                        {
                            var states = widgetStates.Where(x => widgetStateIds.Contains(x.Type));
                            ProviderState newState = new ProviderState()
                            {
                                Designation = updateState.Designation,
                                StandardId = updateState.StandardId,
                                StateId = updateState.StateId,
                                WidgetStates = states.ToList()
                            };
                            context.ProviderStates.Add(newState);

                        }
                    }
                    context.SaveChanges();
                }
            }
        }

        public void Synch(List<ProviderState> states)
        {
            using (log.Activity(m => m($"{nameof(Synch)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Read {nameof(ProviderState)}")))
                {
                    if (!states.Any())
                    {
                        throw new KeyNotFoundException(); 
                    }
                    var standardIds = states.Select(x => x.StandardId);
                    var currentStates = context.ProviderStates.Where(x => standardIds.Contains(x.StandardId)).ToList();
                    foreach (ProviderState state in states)
                    {
                        ProviderState currentState = state.StandardId == null ? 
                            currentStates.FirstOrDefault(x => x.Designation == state.Designation) : 
                            currentStates.FirstOrDefault(x => x.StandardId == state.StandardId);

                        if (currentState == null ) continue;

                        currentState.Designation = state.Designation;
                        currentState.StateId = state.StateId;
                    }
                    log.Activity(m => m($"Update {nameof(ProviderState)}"));
                    context.SaveChanges(); 
                }
            }
        }
        
        public IEnumerable<ProviderState> GetProviderStates()
        {
            using (log.Activity(m => m($"{nameof(GetProviderStates)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Read {nameof(ProviderState)}")))
                {
                    return context.ProviderStates.Include(x => x.WidgetStates);
                }
            }
        }

        public void Ensure()
        {
            using (log.Activity(m => m($"{nameof(Ensure)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Creating User States Mappings")))
                {
                    context.SeedUserStatesMappings();
                }
            }
        }

        public void SynchDeletedStates(List<ProviderState> states)
        {
            using (log.Activity(m => m($"{nameof(Ensure)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m($"Synchronizing deleted states")))
                {
                    var stateIds = states.Select(x => x.StateId);
                    var statesToRemove = context.ProviderStates.Where(x => !stateIds.Contains(x.StateId) && x.StandardId == null);
                    foreach (ProviderState providerState in statesToRemove)
                    {
                        context.ProviderStates.Remove(providerState);
                    }

                    context.SaveChanges();
                }
            }
        }
    }
}