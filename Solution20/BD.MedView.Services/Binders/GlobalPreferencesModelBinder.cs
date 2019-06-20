using BD.MedView.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;

namespace BD.MedView.Services.Binders
{
    public class GlobalPreferencesModelBinder : IModelBinder
    {
        public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
        {
            if (bindingContext.ModelType != typeof(GlobalPreferences))
            {
                return false;
            }

            bindingContext.Model = new InfusionPreference();
            return true;
        }
    }
}