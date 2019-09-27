using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BD.MedView.Services.Utilities
{
    public interface IContextResolver 
    {
        string User { get; }
        Guid Activity { get; }
        DateTime When { get; }
    }

    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class ContextResolver : IContextResolver
    {
        private Guid activityId = Guid.NewGuid();

        public string User => System.Threading.Thread.CurrentPrincipal?.Identity?.Name;

        public Guid Activity { 
            get {
                if (HttpContext.Current != null)
                {
                    if (HttpContext.Current.Items["BD.MedView.Services.Utilities.ContextResolver.Activity"] != null)
                    {
                        activityId = (Guid)HttpContext.Current.Items["BD.MedView.Services.Utilities.ContextResolver.Activity"];
                    }
                    else
                    {
                        HttpContext.Current.Items["BD.MedView.Services.Utilities.ContextResolver.Activity"] = activityId;
                    }
                }
                return activityId;
            }
        }

        public DateTime When => DateTime.Now;
    }
}