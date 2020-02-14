using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;

namespace WebApplication4.SpaExtensions
{
    public static class LocalizedSpaStaticFilesExtensions
    {
        public static void AddSpaStaticFilesLocales(this IServiceCollection services,
                    string[] availableLocales)
        {
            services.AddTransient<IUserLanguageService>(serviceProvider =>
            {
                var httpContextAccessor = serviceProvider.GetRequiredService<IHttpContextAccessor>();
                return new UserLanguageService(httpContextAccessor, availableLocales);
            });
            services.AddTransient<LocalizedSpaStaticFilePathProvider>(serviceProvider =>
            {
                var userLanguageService = serviceProvider.GetRequiredService<IUserLanguageService>();
                return new LocalizedSpaStaticFilePathProvider(userLanguageService);
            });
        }

        public static void UseSpaStaticFilesLocales(this IApplicationBuilder applicationBuilder, string defaultFile = "index.html")
        {
            applicationBuilder.Use((context, next) =>
            {
                // In this part of the pipeline, the request path is altered to point to a localized SPA asset
                var spaFilePathProvider = context.RequestServices.GetRequiredService<LocalizedSpaStaticFilePathProvider>();
                context.Request.Path = spaFilePathProvider.GetRequestPath(context.Request.Path, defaultFile);
                return next();
            });
            applicationBuilder.UseSpaStaticFiles();
        }
    }
}
