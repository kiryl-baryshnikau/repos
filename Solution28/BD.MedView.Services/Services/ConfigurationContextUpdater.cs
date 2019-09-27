using System;
using System.Linq;
using BD.MedView.Configuration;
using BD.MedView.Services.Extensions;
using BD.MedView.Services.Utilities;
using Common.Logging;
using Microsoft.Extensions.Options;

namespace BD.MedView.Services.Services
{
    #region Interface
    public interface IConfigurationContextUpdater :
        IObserver<EntityEvent<Facility.Facility>>,
        IObserver<EntityEvent<Facility.Provider>>,
        IObserver<EntityEvent<Facility.Synonym>>,
        IObserver<EntityEvent<Authorization.Principal>>,
        IObserver<EntityLinkEvent<Authorization.Principal, Authorization.Role>>,
        IObserver<EntityLinkEvent<Authorization.Role, Authorization.Principal>>
    {
    }
    #endregion Interface

    #region Options
    public class ConfigurationContextUpdaterOptions
    {
        public int DefaultSessionTimeout { get; set; }
        public bool DefaultMaskData { get; set; }
    }
    #endregion Options

    #region Implementation
    public class ConfigurationContextUpdater : IConfigurationContextUpdater
    {
        private readonly IOptions<ConfigurationContextUpdaterOptions> options;
        private readonly ILog log;
        private readonly IContext context;

        public ConfigurationContextUpdater(
            IOptions<ConfigurationContextUpdaterOptions> options,
            ILog log,
            IContext context
            )
        {
            this.options = options;
            this.log = log;
            this.context = context;
        }

        #region IObserver<EntityEvent<Facility.Facility>>
        void IObserver<EntityEvent<Facility.Facility>>.OnCompleted()
        {
        }

        void IObserver<EntityEvent<Facility.Facility>>.OnError(Exception error)
        {
        }

        void IObserver<EntityEvent<Facility.Facility>>.OnNext(EntityEvent<Facility.Facility> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityEvent<Facility.Facility>)} event")))
            {
                if (value.OldValue == null && value.NewValue != null)
                {
                    OnCreated(value.NewValue);
                }
                else if (value.OldValue != null && value.NewValue != null)
                {
                    OnUpdated(value.NewValue, value.OldValue);
                }
                else if (value.OldValue != null && value.NewValue == null)
                {
                    OnDeleted(value.OldValue);
                }
                else
                {
                    log.Trace(m => m($"{nameof(EntityEvent<Facility.Facility>)} event is ignored"));
                }
            }
        }

        private void OnCreated(Facility.Facility value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnCreated)} for {nameof(Facility.Facility)}[{value.Id}]")))
            {
                //TODO: KB: For users who have select "000000" should new facility added
                OnFacilityCreated(value.Name);
            }
        }

        private void OnUpdated(Facility.Facility value, Facility.Facility original)
        {
        }

        private void OnDeleted(Facility.Facility value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnDeleted)} for {nameof(Facility.Facility)}[{value.Id}]")))
            { 
                //TODO: KB: For users who have facility - should be removed
                OnFacilityDeleted(value.Name);
            }
        }
        #endregion

        #region IObserver<EntityEvent<Facility.Provider>>
        void IObserver<EntityEvent<Facility.Provider>>.OnCompleted()
        {
        }

        void IObserver<EntityEvent<Facility.Provider>>.OnError(Exception error)
        {
        }

        void IObserver<EntityEvent<Facility.Provider>>.OnNext(EntityEvent<Facility.Provider> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityEvent<Facility.Provider>)} event")))
            {
                if (value.OldValue == null && value.NewValue != null)
                {
                    OnCreated(value.NewValue);
                }
                else if (value.OldValue != null && value.NewValue != null)
                {
                    OnUpdated(value.NewValue, value.OldValue);
                }
                else if (value.OldValue != null && value.NewValue == null)
                {
                    OnDeleted(value.OldValue);
                }
                else
                {
                    log.Trace(m => m($"{nameof(EntityEvent<Facility.Provider>)} event is ignored"));
                }
            }
        }

        private void OnCreated(Facility.Provider value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnCreated)} for {nameof(Facility.Provider)}[{value.Id}]")))
            {
                //TODO: Complete
            }
        }

        private void OnUpdated(Facility.Provider value, Facility.Provider original)
        {
            using (log.Activity(m => m($"Execute {nameof(OnUpdated)} for {nameof(Facility.Provider)}[{value.Id}]")))
            {
                //TODO: Complete
            }
        }

        private void OnDeleted(Facility.Provider value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnDeleted)} for {nameof(Facility.Provider)}[{value.Id}]")))
            {
                //TODO: Complete
            }
        }
        #endregion

        #region IObserver<EntityEvent<Facility.Synonym>>
        void IObserver<EntityEvent<Facility.Synonym>>.OnCompleted()
        {
        }

        void IObserver<EntityEvent<Facility.Synonym>>.OnError(Exception error)
        {
        }

        void IObserver<EntityEvent<Facility.Synonym>>.OnNext(EntityEvent<Facility.Synonym> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityEvent<Facility.Synonym>)} event")))
            {
                if (value.OldValue == null && value.NewValue != null)
                {
                    OnCreated(value.NewValue);
                }
                else if (value.OldValue != null && value.NewValue != null)
                {
                    OnUpdated(value.NewValue, value.OldValue);
                }
                else if (value.OldValue != null && value.NewValue == null)
                {
                    OnDeleted(value.OldValue);
                }
                else
                {
                    log.Trace(m => m($"{nameof(EntityEvent<Facility.Synonym>)} event is ignored"));
                }
            }
        }

        private void OnCreated(Facility.Synonym value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnCreated)} for {nameof(Facility.Synonym)}[{value.Id}]")))
            {
                //TODO: Complete
            }
        }

        private void OnUpdated(Facility.Synonym value, Facility.Synonym original)
        {
            using (log.Activity(m => m($"Execute {nameof(OnUpdated)} for {nameof(Facility.Synonym)}[{value.Id}]")))
            {
                //TODO: Complete
            }
        }

        private void OnDeleted(Facility.Synonym value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnDeleted)} for {nameof(Facility.Synonym)}[{value.Id}]")))
            {
                //TODO: Complete
            }
        }
        #endregion

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

        #region IObserver<EntityLinkEvent<Authorization.Principal, Authorization.Role>>
        void IObserver<EntityLinkEvent<Authorization.Principal, Authorization.Role>>.OnCompleted()
        {
        }

        void IObserver<EntityLinkEvent<Authorization.Principal, Authorization.Role>>.OnError(Exception error)
        {
        }

        void IObserver<EntityLinkEvent<Authorization.Principal, Authorization.Role>>.OnNext(EntityLinkEvent<Authorization.Principal, Authorization.Role> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityLinkEvent<Authorization.Principal, Authorization.Role>)} event")))
            {
                //add
                if (value.Link)
                {
                    OnAdded(value.Left, value.Right);
                }
                //remove
                else
                {
                    OnRemoved(value.Left, value.Right);
                }
            }
        }

        private void OnAdded(Authorization.Principal left, Authorization.Role right)
        {
            using (log.Activity(m => m($"Execute {nameof(OnAdded)} for {nameof(Authorization.Principal)}[{left.Id}] and {nameof(Authorization.Role)}[{right.Id}]")))
            {
                OnPrincipalRolesChanged(left.Name);
            }
        }

        private void OnRemoved(Authorization.Principal left, Authorization.Role right)
        {
            using (log.Activity(m => m($"Execute {nameof(OnRemoved)} for {nameof(Authorization.Principal)}[{left.Id}] and {nameof(Authorization.Role)}[{right.Id}]")))
            {
                OnPrincipalRolesChanged(left.Name);
            }
        }
        #endregion

        #region IObserver<EntityLinkEvent<Authorization.Role, Authorization.Principal>>
        void IObserver<EntityLinkEvent<Authorization.Role, Authorization.Principal>>.OnCompleted()
        {
        }

        void IObserver<EntityLinkEvent<Authorization.Role, Authorization.Principal>>.OnError(Exception error)
        {
        }

        void IObserver<EntityLinkEvent<Authorization.Role, Authorization.Principal>>.OnNext(EntityLinkEvent<Authorization.Role, Authorization.Principal> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityLinkEvent<Authorization.Role, Authorization.Principal>)} event")))
            {
                //add
                if (value.Link)
                {
                    OnAdded(value.Left, value.Right);
                }
                //remove
                else
                {
                    OnRemoved(value.Left, value.Right);
                }
            }
        }

        private void OnAdded(Authorization.Role left, Authorization.Principal right)
        {
            using (log.Activity(m => m($"Execute {nameof(OnAdded)} for {nameof(Authorization.Role)}[{left.Id}] and {nameof(Authorization.Principal)}[{right.Id}]")))
            {
                OnAdded(right, left);
            }
        }

        private void OnRemoved(Authorization.Role left, Authorization.Principal right)
        {
            using (log.Activity(m => m($"Execute {nameof(OnRemoved)} for {nameof(Authorization.Role)}[{left.Id}] and {nameof(Authorization.Principal)}[{right.Id}]")))
            {
                OnRemoved(right, left);
            }
        }
        #endregion

        #region To Be Optimized By Configuration Service team
        public void OnPrincipalCreated(string name)
        {
            var value = new UserPreference
            {
                User = name,
                SessionTimeout = options.Value.DefaultSessionTimeout,
                MaskData = options.Value.DefaultMaskData,
            };
            var entity = context.UserPreferences.Add(value);
            context.SaveChanges();
        }

        public void OnPrincipalChanged(string newName, string oldName)
        {
            var entity = context.UserPreferences.FirstOrDefault(item => item.User == oldName);
            if (entity != null)
            {
                entity.User = newName;
                context.SaveChanges();
            }
        }

        public void OnPrincipalDeleted(string name)
        {
            var entity = context.UserPreferences.FirstOrDefault(item => item.User == name);
            if (entity != null)
            {
                context.UserPreferences.Remove(entity);
                context.SaveChanges();
            }
        }

        public void OnPrincipalRolesChanged(string principalName)
        {
        }

        public void OnFacilityCreated(string facilityName)
        {
        }

        public void OnFacilityDeleted(string facilityName)
        {
        }
        #endregion
    }
    #endregion Implementation
}