using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens;

using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Owin;

using Common.Logging;
using BD.MedView.Services.Extensions;
using System.Threading;

[assembly: OwinStartup(typeof(BD.MedView.Services.Startup))]
namespace BD.MedView.Services
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class Startup
    {
        //Error Logging
        private static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public void Configuration(IAppBuilder app)
        {
            log.Info("Services Owin Startup started.");

            try
            {
                using (log.Activity(m => m($"Configuring Identity")))
                {
                    app.UseCors(CorsOptions.AllowAll);

                    JwtSecurityTokenHandler.InboundClaimTypeMap = new Dictionary<string, string>();

                    //app.UseCookieAuthentication(new CookieAuthenticationOptions
                    //{
                    //    AuthenticationType = "Cookies"
                    //});

                    //TODO: Fild how to resolve it
                    app.UseIdentityServerBearerTokenAuthentication(Services.ConfigurationService.IdentityServerBearerTokenAuthenticationOptions.Value);
                }

                using (log.Activity(m => m($"Configuring WebApi")))
                {
                    app.UseWebApi(WebApiConfig.Register());
                }

                using (log.Activity(m => m($"Configuring Shutdown")))
                {
                    var context = new OwinContext(app.Properties);
                    var token = context.Get<CancellationToken>("host.OnAppDisposing");
                    if (token != CancellationToken.None)
                    {
                        token.Register(() =>
                        {
                            this.OnAppDisposing(app);
                        });
                    }
                }

                log.Info("BD.MedView.Services Startup succeded.");
            }
            catch (Exception ex)
            {
                log.Fatal("Error occured in BD.MedView.Services Startup.", ex);
            }
        }

        public void OnAppDisposing(IAppBuilder app)
        {
            using (log.Activity(m => m($"Executing {nameof(Startup)}.{nameof(OnAppDisposing)}")))
            {
                log.Info("BD.MedView.Services Disposing succeeded.");
            }
        }

    }
}
