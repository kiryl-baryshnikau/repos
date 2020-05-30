using CareFusion.Infusion.Viewer.InfusionSink;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;

namespace WebApplication2
{
    public class Global : System.Web.HttpApplication
    {
        public static ServiceHost selfHost = new ServiceHost(typeof(InfusionBusinessService));

        protected void Application_Start(object sender, EventArgs e)
        {
            selfHost.Open();
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {
            selfHost.Close();
        }
    }
}