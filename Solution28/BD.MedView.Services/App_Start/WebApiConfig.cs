using System.Linq;
using System.Web.Http;
//using System.Web.Http.Dispatcher;
//using System.Web.OData.Builder;
//using System.Web.OData.Extensions;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;
using System.Web.Http.Cors;
using BD.MedView.Services.Extensions;
using Common.Logging;

namespace BD.MedView.Services
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]

    public class WebApiConfig
    {
        public static HttpConfiguration Register()
        {
            var config = new HttpConfiguration();
            config.Formatters.Remove(config.Formatters.XmlFormatter);
            
            //TODO: KB: What index should be?
            config.Formatters.Insert(0, new TextMediaTypeFormatter());

            // Web API configuration and services
            config
              .Formatters
              .JsonFormatter
              .SerializerSettings
              .ContractResolver = new CamelCasePropertyNamesContractResolver();

            config
              .Formatters
              .JsonFormatter
              .SerializerSettings
              .ReferenceLoopHandling = ReferenceLoopHandling.Ignore;

            config.DependencyResolver = DependenciesConfiguration.Register();

            config.MessageHandlers.Add(new LogDelegatingHandler(LogManager.GetLogger(typeof(WebApiConfig))));

            // Web API routes
            config.MapHttpAttributeRoutes();

            //config.EnableCors(new EnableCorsAttribute("*", "accept, authorization", "*", "WWW-Authenticate"));
            config.EnableCors(new EnableCorsAttribute("*", "accept, authorization", "*"));

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            //TODO: KB: Find out correct format
            config.Routes.MapHttpRoute(
                name: "Api with action",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            return config;
        }
    }
}