using System.Reflection;
using System.Web.Http;

using Autofac;
using Autofac.Integration.WebApi;

using System.Web.Http.Dependencies;
using BD.MedView.Services.Services;
using System;
using BD.MedView.Services.Utilities;

using System.Linq;
using Common.Logging;
using Autofac.Core;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.SqlServer;
using BD.MedView.Services.Models;
using Microsoft.Extensions.Options;

namespace BD.MedView.Services
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class DependenciesConfiguration
    {
        public class LoggingModule : Autofac.Module
        {
            private static void InjectLoggerProperties(object instance)
            {
                instance.GetType()
                    .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Where(p => p.PropertyType == typeof(ILog) && p.CanWrite && p.GetIndexParameters().Length == 0)
                    .ToList()
                    .ForEach(p => p.SetValue(instance, LogManager.GetLogger(instance.GetType()), null));
            }

            private static void OnComponentPreparing(object sender, PreparingEventArgs e)
            {
                e.Parameters = e.Parameters
                    .Union(new[] {
                        new ResolvedParameter(
                            (p, i) => p.ParameterType == typeof(ILog),
                            (p, i) => LogManager.GetLogger(p.Member.DeclaringType)
                        ),
                    });
            }

            protected override void AttachToComponentRegistration(IComponentRegistry componentRegistry, IComponentRegistration registration)
            {
                registration.Preparing += OnComponentPreparing;
                registration.Activated += (sender, e) => InjectLoggerProperties(e.Instance);
            }
        }

        public static IDependencyResolver Register()
        {
            var builder = new ContainerBuilder();

            builder.RegisterModule<LoggingModule>();
            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

            builder.RegisterType<Utilities.ContextResolver>().As<Utilities.IContextResolver>().InstancePerRequest();
            builder.RegisterType<Models.ConfigurationContext>().As<Configuration.IContext>().InstancePerRequest();
            builder.RegisterType<Models.AuthorizationContext>().As<Authorization.IContext>().InstancePerRequest();
            builder.RegisterType<Models.FacilityContext>().As<Facility.IContext>().InstancePerRequest();
            builder.RegisterType<Models.RuntimeContext>().As<Runtime.IContext>().InstancePerRequest();

            builder.RegisterType<AuthorizationContextUpdater>().As<IAuthorizationContextUpdater>().InstancePerRequest();
            builder.RegisterType<ConfigurationContextUpdater>().As<IConfigurationContextUpdater>().InstancePerRequest();
            builder.RegisterType<RuntimeContextUpdater>().As<IRuntimeContextUpdater>().InstancePerRequest();
            builder.RegisterType<AttentionNoticeStatusesTracker>().As<IAttentionNoticeStatusesTracker>().InstancePerRequest();
            builder.RegisterType<InfusionServiceUpdater>().As<IInfusionServiceUpdater>().InstancePerRequest();

            builder.RegisterType<SecurityService>().As<IEntitySecurity<Models.Source>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Facility.Facility>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Facility.Provider>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Facility.Synonym>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Authorization.Principal>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Authorization.PrincipalClaim>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Authorization.Role>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntityLinkSecurity<Authorization.Principal, Authorization.Role>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntityLinkSecurity<Authorization.Role, Authorization.Principal>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Configuration.UserPreference>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Configuration.FacilityPatientIdMapping>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Runtime.AttentionNoticeStatus>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<ICacheSecurity>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntityAccessSecurity<Authorization.Access>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Runtime.LastActiveRoute>>().InstancePerRequest();
            builder.RegisterType<SecurityService>().As<IEntitySecurity<Configuration.GlobalPreference>>().InstancePerRequest();

            builder.RegisterType<EntityEmitter<Facility.Facility>>().As<IEntityEmitter<Facility.Facility>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Facility.Provider>>().As<IEntityEmitter<Facility.Provider>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Facility.Synonym>>().As<IEntityEmitter<Facility.Synonym>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Authorization.Principal>>().As<IEntityEmitter<Authorization.Principal>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Authorization.PrincipalClaim>>().As<IEntityEmitter<Authorization.PrincipalClaim>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Authorization.Role>>().As<IEntityEmitter<Authorization.Role>>().InstancePerRequest();
            builder.RegisterType<EntityLinkEmitter<Authorization.Principal, Authorization.Role>>().As<IEntityLinkEmitter<Authorization.Principal, Authorization.Role>>().InstancePerRequest();
            builder.RegisterType<EntityLinkEmitter<Authorization.Role, Authorization.Principal>>().As<IEntityLinkEmitter<Authorization.Role, Authorization.Principal>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Configuration.UserPreference>>().As<IEntityEmitter<Configuration.UserPreference>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Runtime.AttentionNoticeStatus>>().As<IEntityEmitter<Runtime.AttentionNoticeStatus>>().InstancePerRequest();
            builder.RegisterType<EntityAccessEmitter<Runtime.AttentionNoticeStatus>>().As<IEntityAccessEmitter<Runtime.AttentionNoticeStatus>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Runtime.LastActiveRoute>>().As<IEntityEmitter<Runtime.LastActiveRoute>>().InstancePerRequest();
            //builder.RegisterType<EntityEmitter<Preference>>().As<IEntityEmitter<Preference>>().InstancePerRequest();
            builder.RegisterType<EntityEmitter<Configuration.GlobalPreference>>().As<IEntityEmitter<Configuration.GlobalPreference>>().InstancePerRequest();

            //builder.RegisterType<EffectivePermissionsService>().As<IEffectivePermissionsService>().InstancePerRequest();
            builder.RegisterType<UserPreferencesService>().As<IUserPreferencesService>().InstancePerRequest();

            builder.RegisterType<GlobalPreferencesService>().As<IGlobalPreferencesService>()
                .OnActivated(e =>
                {
                    e.Instance.Subscribe(e.Context.Resolve<IInfusionServiceUpdater>() as IObserver<EntityEvent<Configuration.GlobalPreference>>);
                })
                .InstancePerRequest();
            //builder.RegisterType<PreferenceFactory>().As<IPreferenceFactory>().InstancePerRequest();

            builder.RegisterType<SourcesService>().As<ISourcesService>().InstancePerRequest();

            builder.RegisterType<FacilitiesService>().As<IFacilitiesService>()
                .OnActivated(e =>
                {
                    e.Instance.Subscribe(e.Context.Resolve<IAuthorizationContextUpdater>() as IObserver<EntityEvent<Facility.Facility>>);
                    e.Instance.Subscribe(e.Context.Resolve<IConfigurationContextUpdater>() as IObserver<EntityEvent<Facility.Facility>>);
                })
                .InstancePerRequest();

            builder.RegisterType<SynonymsService>().As<ISynonymsService>()
                .OnActivated(e =>
                {
                    e.Instance.Subscribe(e.Context.Resolve<IConfigurationContextUpdater>() as IObserver<EntityEvent<Facility.Synonym>>);
                })
                .InstancePerRequest();

            builder.RegisterType<ProvidersService>().As<IProvidersService>()
                .OnActivated(e =>
                {
                    e.Instance.Subscribe(e.Context.Resolve<IConfigurationContextUpdater>() as IObserver<EntityEvent<Facility.Provider>>);
                })
                .InstancePerRequest();

            builder.RegisterType<PrincipalsService>().As<IPrincipalsService>()
                .OnActivated(e =>
                {
                    e.Instance.Subscribe(e.Context.Resolve<IConfigurationContextUpdater>() as IObserver<EntityEvent<Authorization.Principal>>);
                    e.Instance.Subscribe(e.Context.Resolve<IConfigurationContextUpdater>() as IObserver<EntityLinkEvent<Authorization.Principal, Authorization.Role>>);
                    e.Instance.Subscribe(e.Context.Resolve<IRuntimeContextUpdater>() as IObserver<EntityEvent<Authorization.Principal>>);
                })
                .InstancePerRequest();

            builder.RegisterType<PrincipalClaimsService>().As<IPrincipalClaimsService>().InstancePerRequest();

            builder.RegisterType<RolesService>().As<IRolesService>()
                .OnActivated(e =>
                {
                    e.Instance.Subscribe(e.Context.Resolve<IConfigurationContextUpdater>() as IObserver<EntityLinkEvent<Authorization.Role, Authorization.Principal>>);
                })
                .InstancePerRequest();
            builder.RegisterType<AttentionNoticeStatusesService>().As<IAttentionNoticeStatusesService>()
                .OnActivated(e =>
                {
                    e.Instance.Subscribe(e.Context.Resolve<IAttentionNoticeStatusesTracker>() as IObserver<EntityEvent<Runtime.AttentionNoticeStatus>>);
                    e.Instance.Subscribe(e.Context.Resolve<IAttentionNoticeStatusesTracker>() as IObserver<EntityAccessEvent<Runtime.AttentionNoticeStatus>>);
                })
                .InstancePerRequest();
            builder.RegisterType<LastActiveRoutesService>().As<ILastActiveRoutesService>().InstancePerRequest();
            builder.RegisterType<UserPreferencesService>().As<IUserPreferencesService>().InstancePerRequest();
            builder.RegisterType<FacilityPatientIdMappingsService>().As<IFacilityPatientIdMappingsService>().InstancePerRequest();
            builder.RegisterType<StateMappingsConfigurationService>().As<IStateMappingsConfigurationService>().InstancePerRequest();
            builder.RegisterType<SilentProvisioningService>().As<ISilentProvisioningService>().InstancePerRequest();
            builder.RegisterType<CacheContext>().As<IDistributedCache>().InstancePerRequest();
            builder.RegisterType<CacheService>().As<ICacheService>().InstancePerRequest();
            builder.RegisterType<AccessesService>().As<IAccessesService>().InstancePerRequest();

            builder.RegisterType<AccessTokenResolver>().As<IAccessTokenResolver>().InstancePerRequest();
            builder.RegisterType<HttpClientResolver>().As<IHttpClientResolver>().InstancePerRequest();
            builder.RegisterType<OrderService>().As<IOrderService>().InstancePerRequest();
            builder.RegisterType<HsvIntegrationService>().As<IHsvIntegrationService>().InstancePerRequest();
            builder.RegisterType<SecondaryDataService>().As<ISecondaryDataService>().InstancePerRequest();

            builder.RegisterType<ConfigurationService>().As<IOptions<SecondaryDataServiceOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<HsvIntegrationServiceOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<OrderServiceOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<SqlServerCacheOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<GlobalPreferencesServiceOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<InfusionServiceUpdaterOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<ConfigurationContextUpdaterOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<SilentProvisioningServiceOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<AttentionNoticeStatusesTrackerOptions>>().InstancePerRequest();
            builder.RegisterType<ConfigurationService>().As<IOptions<IdentityServer3.AccessTokenValidation.IdentityServerBearerTokenAuthenticationOptions>>().InstancePerRequest();

            builder.RegisterType<TestsService>().As<ITestsService>().InstancePerRequest();

            builder.RegisterWebApiFilterProvider(GlobalConfiguration.Configuration);


            return new AutofacWebApiDependencyResolver(builder.Build());
        }
    }
}