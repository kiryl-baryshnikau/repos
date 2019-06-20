using BD.MedView.Configuration;
using BD.MedView.Services.Binders;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;
using System.Web.Http.ModelBinding.Binders;

namespace BD.MedView.Services
{

    public class MyActionSelector : ApiControllerActionSelector
    {
        public override HttpActionDescriptor SelectAction(
                                    HttpControllerContext context)
        {
            HttpMessageContent requestContent = new HttpMessageContent(
                                                               context.Request);
            var json = requestContent.HttpRequestMessage.Content
                                    .ReadAsStringAsync().Result;
            string type = (string)JObject.Parse(json)["Type"];

            var actionMethod = context.ControllerDescriptor.ControllerType
                .GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .FirstOrDefault(m => m.Name == "Create");

            if (actionMethod != null)
            {
                return new ReflectedHttpActionDescriptor(
                                   context.ControllerDescriptor, actionMethod);
            }

            return base.SelectAction(context);
        }
    }

    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            //var provider = new SimpleModelBinderProvider(typeof(GlobalPreferences), new GlobalPreferencesModelBinder());
            //config.Services.Insert(typeof(ModelBinderProvider), 0, provider);

            config.Services.Replace(typeof(IHttpActionSelector),
                                                new MyActionSelector());

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
