using BD.MedView.Authorization;
using BD.MedView.Services.Extensions;
using Common.Logging;
using IdentityModel.Client;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading;

namespace BD.MedView.Services.Services
{
    #region Interface
    public interface ISilentProvisioningService
    {
        void Provision(IPrincipal principal);
    }
    #endregion Interface

    #region Options
    public class SilentProvisioningServiceOptions
    {
        public string IdentityServerUrl { get; set; }
    }
    #endregion Options

    #region Implementation
    public class Impersonate : IDisposable
    {
        private IPrincipal saved;
        public Impersonate(IPrincipal principal)
        {
            saved = Thread.CurrentPrincipal;
            Thread.CurrentPrincipal = principal;
        }
        public void Dispose()
        {
            Thread.CurrentPrincipal = saved;
        }
    }

    public class SilentProvisioningService : ISilentProvisioningService
    {
        private readonly IOptions<SilentProvisioningServiceOptions> options;
        private readonly ILog log;
        private readonly IContext context;
        private readonly IEntityLinkEmitter<Principal, Role> linkEmitter;
        private readonly IEntityEmitter<Principal> emitter;
        private readonly IAccessTokenResolver accessTokenResolver;

        const string systemIdentityName = "BD.MedView.Authorization.System";
        const string roleName = "BD.MedView.Web.Super";

        public SilentProvisioningService(
            IOptions<SilentProvisioningServiceOptions> options,
            ILog log,
            IContext context,
            IEntityEmitter<Principal> emitter,
            IEntityLinkEmitter<Principal, Role> linkEmitter,
            IAccessTokenResolver accessTokenResolver
            )
        {
            this.options = options;
            this.log = log;
            this.context = context;
            this.emitter = emitter;
            this.linkEmitter = linkEmitter;
            this.accessTokenResolver = accessTokenResolver;
        }

        public void Provision(IPrincipal principal)
        {
            using (log.Activity(m => m($"Provisioning {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                var userName = null as string;
                using (log.Activity(m => m($"Validate {Thread.CurrentPrincipal?.Identity?.Name}")))
                {
                    var identity = Thread.CurrentPrincipal.Identity as ClaimsIdentity;
                    if (identity == null)
                    {
                        log.Info($"Identity is not ClaimsIdentity or null. Ignore Execution.");
                        return;
                    }
                    userName = identity.Claims.FirstOrDefault(x => x.Type == "user_id")?.Value ?? identity.Name;
                    if (userName == null)
                    {
                        log.Info($"UserName claim value is not found. Ignore Execution.");
                        return;
                    }
                    var isSuperByClaim = IsSuperByClaim(identity);
                    if (!isSuperByClaim)
                    {
                        log.Info($"Required claim value is not found. Ignore Execution.");
                        return;
                    }
                }

                using (log.Activity(m => m($"Impersonating Operation")))
                {
                    //TODO: KB: Do we need to secure operation that always must succeed?
                    using (new Impersonate(new GenericPrincipal(new GenericIdentity(systemIdentityName), new string[0])))
                    {
                        var relation = null as Role;
                        using (log.Activity(m => m($"Read {nameof(Role)}[\"{roleName}\"]")))
                        {
                            relation = context.Roles.Include(item => item.Realm).SingleOrDefault(item => item.Name == roleName);
                        }
                        if (relation == null)
                        {
                            log.Error($"{nameof(Role)}[\"{roleName}\"] is not found");
                            throw new KeyNotFoundException();
                        }

                        var entity = null as Principal;
                        using (log.Activity(m => m($"Read {nameof(Principal)}[\"{userName}\"]")))
                        {
                            entity = context.Principals.Include(item => item.Roles.Select(r => r.Realm)).SingleOrDefault(item => item.Name == userName);
                        }
                        if (entity == null)
                        {
                            log.Info($"{nameof(Principal)}[\"{userName}\"] is not found.");
                            using (log.Activity(m => m("Create Entity")))
                            {
                                try
                                {
                                    entity = context.Principals.Add(new Principal { Name = userName });
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

                        }

                        if (entity.Roles.Any(item => item.Id == relation.Id))
                        {
                            log.Info($"{nameof(Principal)}[\"{userName}\"] already has role {nameof(Role)}[\"{roleName}\"]. Ignore Execution.");
                            return;
                        }

                        using (log.Activity(m => m("Update Entity")))
                        {
                            try
                            {
                                relation.Principals.Add(entity);
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
                                var leftValue = entity.Filter();
                                var rightValue = relation.Filter();
                                linkEmitter.OnAdded(leftValue, rightValue, item => item.Roles);
                            }
                            catch (Exception e)
                            {
                                log.Error($"Emit Event Error", e);
                                throw;
                            }
                        }

                        log.Info($"Provisioned {nameof(Role)}[\"{roleName}\"] to {nameof(Principal)}[\"{userName}\"].{nameof(Principal.Roles)} by {Thread.CurrentPrincipal?.Identity?.Name}");
                    }
                }
            }
        }

        private bool IsSuperByClaim(ClaimsIdentity identity)
        {
            using (log.Activity(m => m($"IsSuperByClaim for {identity}")))
            {
                
                var claimValue = identity.Claims.FirstOrDefault(x => x.Type == "profile")?.Value;
                #region Implementation: It can be can be loaded from original token (no IDM changes are required) or IDM "connect/userinfo" endpoint (IDM changes are required)
                if (claimValue == null && System.Web.HttpContext.Current != null)
                {
                    using (log.Activity(m => m($"Lookup claim in alternative sources")))
                    {
                        try
                        {
                            var identityServerUrl = options.Value.IdentityServerUrl;
                            var userInfoClient = new UserInfoClient(identityServerUrl.TrimEnd('/') + "/connect/userinfo");
                            var response_AccessToken = accessTokenResolver.Resolve();
                            var userInfoResponse = userInfoClient.GetAsync(response_AccessToken).Result;
                            claimValue = userInfoResponse.Claims.FirstOrDefault(x => x.Type == "profile")?.Value;
                            if (claimValue == null)
                            {
                                log.Trace("Claim not found in userInfoResponse.");
                                var originatingAccessTokenKey = "originating_access_token";
                                var originatingAccessToken = userInfoResponse.Claims.FirstOrDefault(x => x.Type == originatingAccessTokenKey)?.Value;
                                var jwtToken = new JwtSecurityToken(originatingAccessToken);
                                claimValue = jwtToken.Claims.FirstOrDefault(x => x.Type == "profile")?.Value;
                                if (claimValue == null)
                                {
                                    log.Trace("Claim not found in originatingAccessToken.");
                                }
                            }
                        }
                        catch (Exception e)
                        {
                            log.Trace("Fail to find claim in UserInfoClient endpoint", e);
                        }
                    }
                }
                #endregion
                if (claimValue == null)
                {
                    log.Trace("Claim is not found in current identity (accessToken).");
                    return false;
                }
                try
                {
                    return JsonConvert.DeserializeAnonymousType(claimValue, new { IsSupportUser = false }).IsSupportUser;
                }
                catch(Exception e)
                {
                    log.Warn($"The claim \"profile\" has incorrect format.", e);
                    return false;
                }
            }
        }
    }
    #endregion Implementation
}