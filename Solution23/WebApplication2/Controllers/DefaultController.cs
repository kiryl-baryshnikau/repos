using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading;
using WebApplication2.Extensions;

namespace WebApplication2.Controllers
{
    [Route("api/[controller]")]
    public class DefaultController: Controller
    {
        private readonly IConfiguration configuration;
        private readonly ILogger<DefaultController> logger;

        private readonly string originatingAccessTokenKey;
        private readonly string identityServerUrl;
        private readonly string identityServerTokenEndpoint;
        private readonly string identityServerEndSessionEndpoint;
        private readonly string identityServerClientId;
        private readonly string identityServerClientSecret;
        private readonly string identityServerClientRedirectUrl;
        private readonly string identityServerPostLogoutRedirectUrl;
        private readonly string identityServerApiRequestUrl;

        public DefaultController(IConfiguration configuration, ILogger<DefaultController> logger)
        {
            this.configuration = configuration;
            this.logger = logger;


            originatingAccessTokenKey = "originating_access_token";
            identityServerUrl = configuration.GetValue<string>("appSettings:IdentityServerUrl");
            identityServerTokenEndpoint = configuration.GetValue<string>("appSettings:IdentityServerTokenEndpoint");
            identityServerEndSessionEndpoint = configuration.GetValue<string>("appSettings:IdentityServerEndSessionEndpoint");
            identityServerClientId = configuration.GetValue<string>("appSettings:IdentityServerClientId");
            identityServerClientSecret = configuration.GetValue<string>("appSettings:IdentityServerClientSecret");
            identityServerClientRedirectUrl = configuration.GetValue<string>("appSettings:IdentityServerClientRedirectUrl");
            identityServerPostLogoutRedirectUrl = configuration.GetValue<string>("appSettings:IdentityServerClientPostLogoutRedirectUrl");
            identityServerApiRequestUrl = new Uri(configuration.GetValue<string>("appSettings:IdentityServerUrl")).GetLeftPart(UriPartial.Authority) + "/" +
                                                     configuration.GetValue<string>("appSettings:IdentityServerApiPath");
        }

        [HttpGet]
        [Route("test")]
        public IActionResult Test()
        {
            using (logger.BeginScope($"Executing {nameof(Test)} by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                var user = this.User.Identity;

                var accessToken = HttpContext.GetTokenAsync("access_token").Result;
                var refreshToken = HttpContext.GetTokenAsync("refresh_token").Result;

                var userInfoClient = new UserInfoClient(identityServerUrl + "connect/userinfo");
                var userInfoResponse = userInfoClient.GetAsync(accessToken).Result;
                var originatingAccessToken = userInfoResponse.Claims.FirstOrDefault(x => x.Type == originatingAccessTokenKey)?.Value;

                return Ok(userInfoResponse.Claims);
            }
        }
        [HttpGet]
        [Route("version")]
        public IActionResult GetVersion()
        {
            using (logger.BeginScope($"Executing {nameof(GetVersion)} by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                var version = "HealthSightViewer v" + (configuration.GetValue<string>("appSettings:application-version") ?? "2.0.4");

                logger.LogInformation(version);

                return Ok(version);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("Authorize")]
        public IActionResult Authorize()
        {
            using (logger.BeginScope($"Executing {nameof(Authorize)} by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                logger.LogInformation("Authorizing");

                return Redirect(identityServerClientRedirectUrl);
            }
        }

        [Route("KeepAlive")]
        [HttpGet]
        public IActionResult KeepAlive()
        {
            using (logger.BeginScope($"Executing {nameof(KeepAlive)} by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                return Ok(User.Identity.IsAuthenticated);
            }
        }

        [Authorize]
        [HttpGet]
        [HttpGet("Token")]
        public IActionResult Token()
        {
            var accessToken = HttpContext.GetTokenAsync("access_token").Result;
            var refreshToken = HttpContext.GetTokenAsync("refresh_token").Result;


            using (logger.BeginScope($"Executing {nameof(Token)} by {Thread.CurrentPrincipal?.Identity?.Name}"))
            {
                if (ExistingTokenExpired())
                {
                    RefreshClaims();
                }

                var tokenClaim = (User.Identity as ClaimsIdentity).Claims.ToDictionary(claim => claim.Type, claim => claim.Value);

                var tokenResponse = new
                {
                    AccessToken = tokenClaim["access_token"],
                    OriginatingAccessToken = tokenClaim[originatingAccessTokenKey],
                    ExpiresIn = tokenClaim["expires_at"],
                    FirstName = tokenClaim["first_name"],
                    LastName = tokenClaim["last_name"],
                    LoginName = tokenClaim["preferred_username"],
                    Email = tokenClaim.ContainsKey("email") ? tokenClaim["email"] : null,
                };

                if (string.IsNullOrEmpty(tokenResponse.AccessToken))
                {
                    //return Json(new TokenResponse(HttpStatusCode.GatewayTimeout, "Refresh token timeout!"), jsonSerializerSettings);
                    return Json(new TokenResponse(HttpStatusCode.GatewayTimeout, "Refresh token timeout!"));
                }

                logger.LogInformation($"Executied {nameof(Token)}");

                //return Json(tokenResponse, jsonSerializerSettings);
                return Json(tokenResponse);
            }
        }

        #region Token
        private void RefreshClaims()
        {
            string originatingAccessToken = string.Empty;

            var claims = (User.Identity as ClaimsIdentity).Claims.ToDictionary(claim => claim.Type, claim => claim.Value);

            var tokenClient = new TokenClient(identityServerUrl + identityServerTokenEndpoint, identityServerClientId, identityServerClientSecret);
            var newToken = tokenClient.RequestRefreshTokenAsync(claims["refresh_token"]).Result;
            var epochExpiresIn = DateTime.UtcNow.AddSeconds(newToken.ExpiresIn).GetEpochTime();

            if (!string.IsNullOrEmpty(newToken.AccessToken))
            {
                var userInfoClient = new UserInfoClient(identityServerUrl + "connect/userinfo");
                var userInfoResponse = userInfoClient.GetAsync(newToken.AccessToken).Result;
                originatingAccessToken = userInfoResponse.Claims.FirstOrDefault(x => x.Type == originatingAccessTokenKey)?.Value;
            }

            User.AddUpdateClaim("access_token", newToken.AccessToken ?? string.Empty);
            User.AddUpdateClaim("expires_at", epochExpiresIn.ToString());
            User.AddUpdateClaim("refresh_token", newToken.RefreshToken ?? string.Empty);
            User.AddUpdateClaim(originatingAccessTokenKey, originatingAccessToken ?? string.Empty);
        }

        //TODO: KB: How to check experation of SAML token if token handler returns "null" on parsing
        private bool ExistingTokenExpired()
        {
            var tokenExpiryTime = Convert.ToDouble((User.Identity as ClaimsIdentity).Claims.First(claim => claim.Type == "expires_at").Value);
            var expired = DateTime.UtcNow.GetEpochTime() > tokenExpiryTime;
            return expired;
        }
        #endregion Token
    }
}
