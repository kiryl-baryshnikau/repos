using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using WebApplication2.Extensions;

namespace WebApplication2
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc(options => 
            {
                options.EnableEndpointRouting = false;
                //This option allows return string as JSON
                options.RespectBrowserAcceptHeader = true;
            });

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });


            //var configuration = Configuration;
            //var identityServerUrl = configuration.GetValue<string>("appSettings:IdentityServerUrl");
            //var tokenEndpoint = configuration.GetValue<string>("appSettings:IdentityServerTokenEndpoint");
            //var clientId = configuration.GetValue<string>("appSettings:IdentityServerClientid");
            //var clientSecret = configuration.GetValue<string>("appSettings:IdentityServerClientSecret");
            //var scopes = configuration.GetValue<string>("appSettings:IdentityServerClientScopes");
            //var redirectUrl = configuration.GetValue<string>("appSettings:IdentityServerClientRedirectUrl");
            //var postLogoutRedirectUrl = configuration.GetValue<string>("appSettings:IdentityServerClientPostLogoutRedirectUrl");
            //var responseType = configuration.GetValue<string>("appSettings:IdentityServerResponseType");
            //var originatingAccessTokenKey = "originating_access_token";
            //var firstNameKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname";
            //var lastNameKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname";
            //var loginNameKey = "preferred_username";
            //var emailKey = "email";


            services
                .AddAuthentication(options => 
                {
                    //options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    //options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
                    //options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    //options.RequireAuthenticatedSignIn = true;
                    Configuration.Bind("Authentication", options);
                })
                .AddCookie(options => 
                {
                    Configuration.Bind("Cookie", options);
                })
                .AddOpenIdConnect(options =>
                {
                    //options.SaveTokens = true;
                    options.GetClaimsFromUserInfoEndpoint = true;
                    Configuration.Bind("OpenIdConnect", options);
                    options.Events = new OpenIdConnectEvents
                    {
                        OnUserInformationReceived = async context =>
                        {
                            await Task.CompletedTask;
                        }
                    };
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            //TODO: Here?
            app.UseAuthentication();


            app.Use(async (context, next) =>
            {
                if (!context.User.Identity.IsAuthenticated)
                {
                    await context.ChallengeAsync("OpenIdConnect");
                }
                else
                {
                    await next();
                }
            });

            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            //TODO: Or Here?

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}
