using System;
using System.Linq;
using BD.MedView.Runtime;
using BD.MedView.Services.Extensions;
using Common.Logging;

namespace BD.MedView.Services.Services
{
    public interface IRuntimeContextUpdater :
        IObserver<EntityEvent<Authorization.Principal>>
    {
    }

    public class RuntimeContextUpdater : IRuntimeContextUpdater
    {
        private readonly ILog log;
        private readonly IContext context;

        public RuntimeContextUpdater(
            ILog log,
            IContext context)
        {
            this.log = log;
            this.context = context;
        }

        #region IObserver<EntityEvent<Authorization.Principal>>
        void IObserver<EntityEvent<Authorization.Principal>>.OnCompleted()
        {
        }

        void IObserver<EntityEvent<Authorization.Principal>>.OnError(Exception error)
        {
        }

        void IObserver<EntityEvent<Authorization.Principal>>.OnNext(EntityEvent<Authorization.Principal> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityEvent<Authorization.Principal>)} event")))
            {
                if (value.OldValue == null && value.NewValue != null)
                {
                    OnCreated(value.NewValue);
                }
                else if (value.OldValue == null && value.NewValue != null)
                {
                    OnUpdated(value.NewValue, value.OldValue);
                }
                else if (value.OldValue != null && value.NewValue == null)
                {
                    OnDeleted(value.OldValue);
                }
                else
                {
                    log.Trace(m => m($"{nameof(EntityEvent<Authorization.Principal>)} event is ignored"));
                }
            }
        }

        private void OnCreated(Authorization.Principal value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnCreated)} for {nameof(Facility.Synonym)}[{value.Id}]")))
            {
                OnPrincipalCreated(value.Name);
            }
        }
        private void OnUpdated(Authorization.Principal value, Authorization.Principal original)
        {
            using (log.Activity(m => m($"Execute {nameof(OnUpdated)} for {nameof(Facility.Synonym)}[{value.Id}]")))
            {
                OnPrincipalChanged(value.Name, original.Name);
            }
        }
        private void OnDeleted(Authorization.Principal value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnDeleted)} for {nameof(Facility.Synonym)}[{value.Id}]")))
            {
                OnPrincipalDeleted(value.Name);
            }
        }
        #endregion

        #region private
        public void OnPrincipalCreated(string name)
        {
            var value = new LastActiveRoute {
                User = name,
                Value = "Configuration"
            };
            var entity = context.LastActiveRoutes.Add(value);
            context.SaveChanges();
        }

        public void OnPrincipalChanged(string newName, string oldName)
        {
            var entity = context.LastActiveRoutes.FirstOrDefault(item => item.User == oldName);
            if (entity != null)
            {
                entity.User = newName;
                context.SaveChanges();
            }
        }

        public void OnPrincipalDeleted(string name)
        {
            var entity = context.LastActiveRoutes.FirstOrDefault(item => item.User == name);
            if (entity != null)
            {
                context.LastActiveRoutes.Remove(entity);
                context.SaveChanges(); 
            }
        }
        #endregion
    }
}