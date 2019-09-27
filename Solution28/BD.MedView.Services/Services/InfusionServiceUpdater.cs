using BD.MedView.Configuration;
using BD.MedView.Services.Extensions;
using BD.MedView.Services.Utilities;
using Common.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;

namespace BD.MedView.Services.Services
{
    #region Interface
    public interface IInfusionServiceUpdater : IObserver<EntityEvent<GlobalPreference>>
    {
    }
    #endregion Interface

    #region Options
    public class InfusionServiceUpdaterOptions
    {
        public string BaseUrl { get; set; }
        public string ApiUrl { get; set; } = $"api/infusionSettings/updateinfusionsettings";
        public string CurrentUserId { get; set; } = "system";
    }
    #endregion Options

    #region Implementation
    public class InfusionServiceUpdater : IInfusionServiceUpdater
    {
        private readonly IOptions<InfusionServiceUpdaterOptions> options;
        private readonly ILog log;
        private readonly IHttpClientResolver httpClientResolver;
        private readonly IAccessTokenResolver accessTokenResolver;

        public InfusionServiceUpdater(
            IOptions<InfusionServiceUpdaterOptions> options,
            ILog log,
            IHttpClientResolver httpClientResolver,
            IAccessTokenResolver accessTokenResolver
            )
        {
            this.options = options;
            this.log = log;
            this.httpClientResolver = httpClientResolver;
            this.accessTokenResolver = accessTokenResolver;
        }

        #region IObserver<EntityEvent<Preference>>
        void IObserver<EntityEvent<GlobalPreference>>.OnCompleted()
        {
        }

        void IObserver<EntityEvent<GlobalPreference>>.OnError(Exception error)
        {
        }

        void IObserver<EntityEvent<GlobalPreference>>.OnNext(EntityEvent<GlobalPreference> value)
        {
            using (log.Activity(m => m($"Processing {nameof(EntityEvent<GlobalPreference>)} event")))
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
                    log.Trace(m => m($"{nameof(EntityEvent<GlobalPreference>)} event is ignored"));
                }
            }
        }
        #endregion

        private void OnCreated(GlobalPreference value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnCreated)} for {nameof(GlobalPreference)}[{value.Name}]")))
            {
                SynchInfusionApi(value);
                log.Info($"Executed {nameof(OnCreated)} for {nameof(GlobalPreference)}[{value.Name}]");
            }
        }

        private void OnUpdated(GlobalPreference value, GlobalPreference original)
        {
            using (log.Activity(m => m($"Execute {nameof(OnUpdated)} for {nameof(GlobalPreference)}[{value.Name}]")))
            {
                SynchInfusionApi(value);
                log.Info($"Executed {nameof(OnUpdated)} for {nameof(GlobalPreference)}[{value.Name}]");
            }
        }

        private void OnDeleted(GlobalPreference value)
        {
            using (log.Activity(m => m($"Execute {nameof(OnDeleted)} for {nameof(GlobalPreference)}[{value.Name}]")))
            {
                log.Info($"Executed {nameof(OnDeleted)} for {nameof(GlobalPreference)}[{value.Name}]");
            }
        }

        private void SynchInfusionApi(GlobalPreference value)
        {
            if (value is InfusionGlobalPreference)
            {
                return;
            }

            var preferences = value as InfusionGlobalPreference;

            var baseUrl = options.Value.BaseUrl;
            var apiUrl = options.Value.ApiUrl;
            var currentUserId = options.Value.CurrentUserId;
            var infusionSettings = ConvertInfusionPreferencesToSettings(preferences, currentUserId);


            var client = httpClientResolver.Resolve();
            client.BaseAddress = new Uri(baseUrl);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            var token = this.accessTokenResolver.Resolve();
            if (!string.IsNullOrWhiteSpace(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
            var response = client.PostAsJsonAsync(apiUrl, infusionSettings).Result;
            response.EnsureSuccessStatusCode();
        }

        public static InfusionSettings ConvertInfusionPreferencesToSettings(InfusionGlobalPreference infusionPreferences, string currentUserId)
        {
            if (infusionPreferences == null)
            {
                throw new ArgumentNullException($"InfusionPreferences can't be null");
            }

            var infusionSettings = new InfusionSettings
            {
                ToleranceValue = infusionPreferences.ContainerTolerance,
                RecordRetainingHours = infusionPreferences.PreserveRecords,
                InfusionDrugFilters = new List<InfusionDrugFilter>()
            };


            if (infusionPreferences.ExcludedInfusions == null || infusionPreferences.ExcludedInfusions.Count == 0)
            {
                return infusionSettings;
            }

            var nullRecordCount =
                infusionPreferences.ExcludedInfusions.Count(x => string.IsNullOrEmpty(x.Name));

            if (nullRecordCount > 0)
            {
                throw new Exception($"ExcludedInfusions collection has null or empty InfusionSetting object");
            }

            foreach (var excludedInfusion in infusionPreferences?.ExcludedInfusions)
            {
                infusionSettings.InfusionDrugFilters.Add(new InfusionDrugFilter()
                {
                    Name = excludedInfusion.Name,
                    IsManuallyEntered = excludedInfusion.AddedByUser,
                    LastModifiedBy = currentUserId,
                    LastModifiedDateTime = DateTime.Now
                });
            }

            return infusionSettings;
        }

        #region InfusionSettings

        /// <summary>
        /// 
        /// </summary>
        public class InfusionSettings
        {
            #region RecordRetainingHours

            /// <summary>
            /// 
            /// </summary>
            public int RecordRetainingHours { get; set; }

            #endregion RecordRetainingHours

            #region ToleranceValue

            /// <summary>
            /// 
            /// </summary>
            public int ToleranceValue { get; set; }

            #endregion ToleranceValue

            #region InfusionDrugFilters

            /// <summary>
            ///     
            /// </summary>
            public List<InfusionDrugFilter> InfusionDrugFilters { get; set; }

            #endregion InfusionDrugFilters
        }

        #endregion InfusionSettings

        #region InfusionDrugFilter

        /// <summary>
        ///     
        /// </summary>
        public class InfusionDrugFilter
        {
            #region Name

            /// <summary>
            ///     
            /// </summary>
            public string Name { get; set; }

            #endregion Name

            #region IsManuallyEntered

            /// <summary>
            /// 
            /// </summary>
            public bool IsManuallyEntered { get; set; }

            #endregion IsManuallyEntered

            #region LastModifiedBy

            /// <summary>
            /// 
            /// </summary>
            public string LastModifiedBy { get; set; }

            #endregion LastModifiedBy

            #region LastModifiedDateTime

            /// <summary>
            /// 
            /// </summary>
            public DateTime LastModifiedDateTime { get; set; }

            #endregion LastModifiedDateTime
        }

        #endregion InfusionDrugFilter
    }
    #endregion Implementation
}