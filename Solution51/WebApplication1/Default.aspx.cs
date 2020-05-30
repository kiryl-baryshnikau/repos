using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace WebApplication1
{
    [ServiceContract(Namespace = "http://carefusion.com/infusion/viewer/RxProcessor/")]
    public interface IConfigurationUpdate
    {
        [OperationContract]
        void SetConfiguration(double tolerance);
    }

    public partial class WebForm1 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            using (var factory = new ChannelFactory<IConfigurationUpdate>("InfusionProcessorConfigNotification"))
            {
                factory.CreateChannel().SetConfiguration(0.03);
            }
        }
    }
}