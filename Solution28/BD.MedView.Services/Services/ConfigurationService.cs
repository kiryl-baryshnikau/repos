using BD.MedView.Configuration;
using BD.MedView.Services.Extensions;
using Common.Logging;
using IdentityServer3.AccessTokenValidation;
using Microsoft.Extensions.Caching.SqlServer;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Configuration;

namespace BD.MedView.Services.Services
{
    public interface IConfigurationService :
        IOptions<SecondaryDataServiceOptions>,
        IOptions<HsvIntegrationServiceOptions>,
        IOptions<OrderServiceOptions>,
        IOptions<SqlServerCacheOptions>,
        IOptions<GlobalPreferencesServiceOptions>,
        IOptions<InfusionServiceUpdaterOptions>,
        IOptions<ConfigurationContextUpdaterOptions>,
        IOptions<SilentProvisioningServiceOptions>,
        IOptions<AttentionNoticeStatusesTrackerOptions>,
        IOptions<IdentityServerBearerTokenAuthenticationOptions>
    {
    }

    public class ConfigurationService : IConfigurationService
    {
        private readonly ILog log;
        private readonly IContext context;

        public ConfigurationService(ILog log, IContext context)
        {
            this.log = log ?? throw new ArgumentNullException(nameof(log));
            this.context = context ?? throw new ArgumentNullException(nameof(context));
            if ((ConfigurationManager.AppSettings["ConfigurationService.Validate"] ?? ConfigurationManager.AppSettings["configuration.validate-on-load"]) == "true")
            {
                using (log.Activity(m => m($"Validating")))
                {
                    try
                    {
                        GetSecondaryDataServiceOptions();
                        GetHsvIntegrationServiceOptions();
                        GetOrderServiceOptions();
                        GetSqlServerCacheOptions();
                        GetGlobalPreferencesServiceOptions();
                        GetInfusionServiceUpdaterOptions();
                        GetConfigurationContextUpdaterOptions();
                        GetSilentProvisioningServiceOptions();
                        GetAttentionNoticeStatusesTrackerOptions();
                        GetIdentityServerBearerTokenAuthenticationOptions();
                    }
                    catch (Exception e)
                    {
                        log.Error(m => m($"Validating failure", e));
                        throw;
                    }
                }
            }
        }

        SecondaryDataServiceOptions IOptions<SecondaryDataServiceOptions>.Value => GetSecondaryDataServiceOptions();
        HsvIntegrationServiceOptions IOptions<HsvIntegrationServiceOptions>.Value => GetHsvIntegrationServiceOptions();
        OrderServiceOptions IOptions<OrderServiceOptions>.Value => GetOrderServiceOptions();
        SqlServerCacheOptions IOptions<SqlServerCacheOptions>.Value => GetSqlServerCacheOptions();
        GlobalPreferencesServiceOptions IOptions<GlobalPreferencesServiceOptions>.Value => GetGlobalPreferencesServiceOptions();
        InfusionServiceUpdaterOptions IOptions<InfusionServiceUpdaterOptions>.Value => GetInfusionServiceUpdaterOptions();
        ConfigurationContextUpdaterOptions IOptions<ConfigurationContextUpdaterOptions>.Value => GetConfigurationContextUpdaterOptions();
        SilentProvisioningServiceOptions IOptions<SilentProvisioningServiceOptions>.Value => GetSilentProvisioningServiceOptions();
        AttentionNoticeStatusesTrackerOptions IOptions<AttentionNoticeStatusesTrackerOptions>.Value => GetAttentionNoticeStatusesTrackerOptions();
        IdentityServerBearerTokenAuthenticationOptions IOptions<IdentityServerBearerTokenAuthenticationOptions>.Value => GetIdentityServerBearerTokenAuthenticationOptions();

        #region private
        private SecondaryDataServiceOptions GetSecondaryDataServiceOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetSecondaryDataServiceOptions)}")))
            {
                var option = new SecondaryDataServiceOptions();
                using (log.Activity(m => m($"Read {nameof(SecondaryDataServiceOptions.CacheAbsoluteExpiration)}")))
                {
                    //TODO: KB: Fix This 
                    var pattern = ConfigurationManager.AppSettings["SecondaryDataServiceOptions.CacheAbsoluteExpiration"] ?? ConfigurationManager.AppSettings["secondary-data.cache.absolute-expiration"];
                    option.CacheAbsoluteExpiration = string.IsNullOrWhiteSpace(pattern) ? (TimeSpan?)null : TimeSpan.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(SecondaryDataServiceOptions.CacheSlidingExpiration)}")))
                {
                    //TODO: KB: Fix This 
                    var pattern = ConfigurationManager.AppSettings["SecondaryDataServiceOptions.CacheSlidingExpiration"] ?? ConfigurationManager.AppSettings["secondary-data.cache.sliding-expiration"];
                    option.CacheSlidingExpiration = string.IsNullOrWhiteSpace(pattern) ? (TimeSpan?)null : TimeSpan.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(SecondaryDataServiceOptions.MaxLimit)}")))
                {
                    //TODO: KB: Fix This 
                    var pattern = ConfigurationManager.AppSettings["SecondaryDataServiceOptions.MaxLimit"] ?? ConfigurationManager.AppSettings["secondary-data.alerts.max-limit"];
                    option.MaxLimit = string.IsNullOrWhiteSpace(pattern) ? option.MaxLimit : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(SecondaryDataServiceOptions.MaxDegreeOfParallelism)}")))
                {
                    //TODO: KB: Fix This 
                    var pattern = ConfigurationManager.AppSettings["SecondaryDataServiceOptions.MaxDegreeOfParallelism"] ?? ConfigurationManager.AppSettings["secondary-data.alerts.max-degree-of-parallelism"];
                    option.MaxDegreeOfParallelism = string.IsNullOrWhiteSpace(pattern) ? option.MaxDegreeOfParallelism : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(SecondaryDataServiceOptions.Variance)}")))
                {
                    //We cannot use context here
                    var connectionString = ConfigurationManager.ConnectionStrings["BD.MedView.Services.Models.CacheContext"]?.ConnectionString;
                    if (!string.IsNullOrWhiteSpace(connectionString))
                    {
                        try
                        {
                            using (var connection = new System.Data.SqlClient.SqlConnection(connectionString))
                            {
                                connection.Open();
                                var command = new System.Data.SqlClient.SqlCommand("SELECT [Configurations] FROM [conf].[GlobalPreferences] WHERE [Name] = 'Infusion'", connection);
                                using (var reader = command.ExecuteReader())
                                {
                                    if (reader.Read())
                                    {
                                        var value = (string)reader[0];
                                        option.Variance = JsonConvert.DeserializeAnonymousType(value, new { OrderServiceVariance = 0 }).OrderServiceVariance;
                                    }
                                }
                            }

                        }
                        catch (Exception e)
                        {
                            log.Error(m => m($"Read {nameof(SecondaryDataServiceOptions.Variance)} failure", e));
                            throw;
                        }
                    }
                }
                using (log.Activity(m => m($"Read {nameof(SecondaryDataServiceOptions.IdKindMapping)}")))
                {
                    //We cannot use context here
                    var connectionString = ConfigurationManager.ConnectionStrings["BD.MedView.Services.Models.CacheContext"]?.ConnectionString;
                    if (!string.IsNullOrWhiteSpace(connectionString))
                    {
                        try
                        {
                            using (var connection = new System.Data.SqlClient.SqlConnection(connectionString))
                            {
                                connection.Open();
                                var command = new System.Data.SqlClient.SqlCommand("SELECT [PatientIdKind],[FhirServiceValue] FROM [conf].[PatientIdKindFhirServiceMappings]", connection);
                                using (var reader = command.ExecuteReader())
                                {
                                    while (reader.Read())
                                    {
                                        var key = (string)reader[0];
                                        var value = (string)reader[0];
                                        option.IdKindMapping[key] = value;
                                    }
                                }
                            }

                        }
                        catch (Exception e)
                        {
                            log.Error(m => m($"Read {nameof(SecondaryDataServiceOptions.IdKindMapping)} failure", e));
                            throw;
                        }
                    }
                }
                return option;
            }
        }

        private HsvIntegrationServiceOptions GetHsvIntegrationServiceOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetHsvIntegrationServiceOptions)}")))
            {
                var option = new HsvIntegrationServiceOptions();
                using (log.Activity(m => m($"Read {nameof(HsvIntegrationServiceOptions.BaseAddress)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["HsvIntegrationServiceOptions:BaseAddress"] ?? ConfigurationManager.AppSettings["med_mined-api-base-url"];
                    option.BaseAddress = string.IsNullOrWhiteSpace(pattern) ? option.BaseAddress : new Uri(pattern);
                }
                return option;
            }
        }

        private OrderServiceOptions GetOrderServiceOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetOrderServiceOptions)}")))
            {
                var option = new OrderServiceOptions();
                using (log.Activity(m => m($"Read {nameof(OrderServiceOptions.BaseAddress)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GetOrderServiceOptions:BaseAddress"] ?? ConfigurationManager.AppSettings["order_service-api-base-url"];
                    option.BaseAddress = string.IsNullOrWhiteSpace(pattern) ? option.BaseAddress : new Uri(pattern);
                }
                return option;
            }
        }

        private SqlServerCacheOptions GetSqlServerCacheOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetSqlServerCacheOptions)}")))
            {
                var option = new SqlServerCacheOptions();
                using (log.Activity(m => m($"Read {nameof(SqlServerCacheOptions.ConnectionString)}")))
                {
                    var pattern = ConfigurationManager.ConnectionStrings["BD.MedView.Services.Models.CacheContext"]?.ConnectionString;
                    option.ConnectionString = string.IsNullOrWhiteSpace(pattern) ? option.ConnectionString : pattern;
                }
                using (log.Activity(m => m($"Read {nameof(SqlServerCacheOptions.SchemaName)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["SqlServerCacheOptions:SchemaName"] ?? ConfigurationManager.AppSettings["cache-schema-name"];
                    option.SchemaName = string.IsNullOrWhiteSpace(pattern) ? "ext" : pattern;
                }
                using (log.Activity(m => m($"Read {nameof(SqlServerCacheOptions.TableName)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["SqlServerCacheOptions:TableName"] ?? ConfigurationManager.AppSettings["cache-schema-name"];
                    option.TableName = string.IsNullOrWhiteSpace(pattern) ? "Cache" : pattern;
                }
                return option;
            }
        }

        private GlobalPreferencesServiceOptions GetGlobalPreferencesServiceOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetGlobalPreferencesServiceOptions)}")))
            {
                var option = new GlobalPreferencesServiceOptions();
                using (log.Activity(m => m($"Read {nameof(GlobalPreferencesServiceOptions.DefatultContainerTolerance)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GlobalPreferencesServiceOptions:DefatultContainerTolerance"] ?? ConfigurationManager.AppSettings["container-tolerance"];
                    option.DefatultContainerTolerance = string.IsNullOrWhiteSpace(pattern) ? option.DefatultContainerTolerance : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(GlobalPreferencesServiceOptions.DefaultPreserveRecords)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GlobalPreferencesServiceOptions:DefaultPreserveRecords"] ?? ConfigurationManager.AppSettings["preserve-records"];
                    option.DefaultPreserveRecords = string.IsNullOrWhiteSpace(pattern) ? option.DefaultPreserveRecords : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(GlobalPreferencesServiceOptions.DefaultPriorityThreshold)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GlobalPreferencesServiceOptions:DefaultPriorityThreshold"] ?? ConfigurationManager.AppSettings["priority-threshold"];
                    option.DefaultPriorityThreshold = string.IsNullOrWhiteSpace(pattern) ? option.DefaultPriorityThreshold : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(GlobalPreferencesServiceOptions.DefaultWarningThreshold)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GlobalPreferencesServiceOptions:DefaultWarningThreshold"] ?? ConfigurationManager.AppSettings["warning-threshold"];
                    option.DefaultWarningThreshold = string.IsNullOrWhiteSpace(pattern) ? option.DefaultWarningThreshold : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(GlobalPreferencesServiceOptions.DefaultUrgentThreshold)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GlobalPreferencesServiceOptions:DefaultUrgentThreshold"] ?? ConfigurationManager.AppSettings["urgent-threshold"];
                    option.DefaultUrgentThreshold = string.IsNullOrWhiteSpace(pattern) ? option.DefaultUrgentThreshold : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(GlobalPreferencesServiceOptions.DefaultRefreshRate)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GlobalPreferencesServiceOptions:DefaultRefreshRate"] ?? ConfigurationManager.AppSettings["refresh-rate"];
                    option.DefaultRefreshRate = string.IsNullOrWhiteSpace(pattern) ? option.DefaultRefreshRate : int.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(GlobalPreferencesServiceOptions.DefaultOrderServiceVariance)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["GlobalPreferencesServiceOptions:DefaultOrderServiceVariance"] ?? ConfigurationManager.AppSettings["order-service-variance"];
                    option.DefaultOrderServiceVariance = string.IsNullOrWhiteSpace(pattern) ? option.DefaultOrderServiceVariance : int.Parse(pattern);
                }
                return option;
            }
        }

        private InfusionServiceUpdaterOptions GetInfusionServiceUpdaterOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetInfusionServiceUpdaterOptions)}")))
            {
                var option = new InfusionServiceUpdaterOptions();
                using (log.Activity(m => m($"Read {nameof(InfusionServiceUpdaterOptions.BaseUrl)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["InfusionServiceUpdaterOptions:BaseUrl"] ?? ConfigurationManager.AppSettings["infusion-api-base-url"];
                    option.BaseUrl = string.IsNullOrWhiteSpace(pattern) ? option.BaseUrl : pattern;
                }
                using (log.Activity(m => m($"Read {nameof(InfusionServiceUpdaterOptions.ApiUrl)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["InfusionServiceUpdaterOptions:ApiUrl"] ?? ConfigurationManager.AppSettings["infusion-api-api-url"];
                    option.ApiUrl = string.IsNullOrWhiteSpace(pattern) ? option.ApiUrl : pattern;
                }
                using (log.Activity(m => m($"Read {nameof(InfusionServiceUpdaterOptions.CurrentUserId)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["InfusionServiceUpdaterOptions:CurrentUserId"] ?? ConfigurationManager.AppSettings["infusion-api-api-current-user-id"];
                    option.CurrentUserId = string.IsNullOrWhiteSpace(pattern) ? option.CurrentUserId : pattern;
                }
                return option;
            }
        }

        private ConfigurationContextUpdaterOptions GetConfigurationContextUpdaterOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetConfigurationContextUpdaterOptions)}")))
            {
                var option = new ConfigurationContextUpdaterOptions();
                using (log.Activity(m => m($"Read {nameof(ConfigurationContextUpdaterOptions.DefaultMaskData)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["ConfigurationContextUpdaterOptions:DefaultMaskData"] ?? ConfigurationManager.AppSettings["default-mask-data"];
                    option.DefaultMaskData = string.IsNullOrWhiteSpace(pattern) ? option.DefaultMaskData : bool.Parse(pattern);
                }
                using (log.Activity(m => m($"Read {nameof(ConfigurationContextUpdaterOptions.DefaultSessionTimeout)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["ConfigurationContextUpdaterOptions:DefaultSessionTimeout"] ?? ConfigurationManager.AppSettings["session-timeout"];
                    option.DefaultSessionTimeout = string.IsNullOrWhiteSpace(pattern) ? option.DefaultSessionTimeout : int.Parse(pattern);
                }
                return option;
            }
        }

        private SilentProvisioningServiceOptions GetSilentProvisioningServiceOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetSilentProvisioningServiceOptions)}")))
            {
                var option = new SilentProvisioningServiceOptions();
                using (log.Activity(m => m($"Read {nameof(SilentProvisioningServiceOptions.IdentityServerUrl)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["SilentProvisioningServiceOptions:IdentityServerUrl"] ?? ConfigurationManager.AppSettings["identity-server-url"];
                    option.IdentityServerUrl = string.IsNullOrWhiteSpace(pattern) ? option.IdentityServerUrl : pattern;
                }
                return option;
            }
        }

        private AttentionNoticeStatusesTrackerOptions GetAttentionNoticeStatusesTrackerOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetAttentionNoticeStatusesTrackerOptions)}")))
            {
                var option = new AttentionNoticeStatusesTrackerOptions();
                using (log.Activity(m => m($"Read {nameof(AttentionNoticeStatusesTrackerOptions.Life)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["AttentionNoticeStatusesTrackerOptions:Life"] ?? ConfigurationManager.AppSettings["attention-notice-status-life"];
                    option.Life = string.IsNullOrWhiteSpace(pattern) ? option.Life : TimeSpan.Parse(pattern);
                }
                return option;
            }
        }

        private IdentityServerBearerTokenAuthenticationOptions GetIdentityServerBearerTokenAuthenticationOptions()
        {
            using (log.Activity(m => m($"Executing {nameof(GetIdentityServerBearerTokenAuthenticationOptions)}")))
            {
                var option = new IdentityServerBearerTokenAuthenticationOptions();
                using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.Authority)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:Authority"] ?? ConfigurationManager.AppSettings["identity-server-url"];
                    option.Authority = string.IsNullOrWhiteSpace(pattern) ? option.Authority : pattern;
                }
                using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.RequiredScopes)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:RequiredScopes"] ?? ConfigurationManager.AppSettings["required-scopes"];
                    option.RequiredScopes = string.IsNullOrWhiteSpace(pattern) ? option.RequiredScopes : pattern.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                }
                using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.ClientId)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:ClientId"] ?? ConfigurationManager.AppSettings["client-id"];
                    option.ClientId = string.IsNullOrWhiteSpace(pattern) ? option.ClientId : pattern;
                }
                using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.ClientSecret)}")))
                {
                    var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:ClientSecret"] ?? ConfigurationManager.AppSettings["client-secret"];
                    option.ClientSecret = string.IsNullOrWhiteSpace(pattern) ? option.ClientSecret : pattern;
                }
                return option;
            }
        }
        #endregion private

        #region static
        //TODO: KB: For some reason cannot use in app_start
        public static IOptions<IdentityServerBearerTokenAuthenticationOptions> IdentityServerBearerTokenAuthenticationOptions
        {
            get
            {
                var log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
                using (log.Activity(m => m($"Executing {nameof(IdentityServerBearerTokenAuthenticationOptions)} get")))
                {
                    var option = new IdentityServerBearerTokenAuthenticationOptions();
                    using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.Authority)}")))
                    {
                        var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:Authority"] ?? ConfigurationManager.AppSettings["identity-server-url"];
                        option.Authority = string.IsNullOrWhiteSpace(pattern) ? option.Authority : pattern;
                    }
                    using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.RequiredScopes)}")))
                    {
                        var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:RequiredScopes"] ?? ConfigurationManager.AppSettings["required-scopes"];
                        option.RequiredScopes = string.IsNullOrWhiteSpace(pattern) ? option.RequiredScopes : pattern.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                    }
                    using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.ClientId)}")))
                    {
                        var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:ClientId"] ?? ConfigurationManager.AppSettings["client-id"];
                        option.ClientId = string.IsNullOrWhiteSpace(pattern) ? option.ClientId : pattern;
                    }
                    using (log.Activity(m => m($"Read {nameof(IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions.ClientSecret)}")))
                    {
                        var pattern = ConfigurationManager.AppSettings["IdentityServerBearerTokenAuthenticationOptions:ClientSecret"] ?? ConfigurationManager.AppSettings["client-secret"];
                        option.ClientSecret = string.IsNullOrWhiteSpace(pattern) ? option.ClientSecret : pattern;
                    }
                    return Options.Create(option);
                }
            }
        }
        #endregion static 
    }
}