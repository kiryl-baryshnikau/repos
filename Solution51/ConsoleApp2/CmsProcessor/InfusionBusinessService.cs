using CareFusion.Infusion.Viewer.Contract;
using System.ServiceModel;

namespace CareFusion.Infusion.Viewer.InfusionSink
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.Single)]
    public class InfusionBusinessService : IConfigurationUpdate
    {
        public void SetConfiguration(double tolerance)
        {
            throw new System.NotImplementedException();
        }
    }
}