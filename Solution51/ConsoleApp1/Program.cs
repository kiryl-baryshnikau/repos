using System.ServiceModel;

namespace ConsoleApp1
{
    #region IConfigurationUpdate

    /// <summary>
    /// 
    /// </summary>
    [ServiceContract(Namespace = "http://carefusion.com/infusion/viewer/RxProcessor/")]
    public interface IConfigurationUpdate
    {
        [OperationContract]
        void SetConfiguration(double tolerance);
    }

    #endregion IConfigurationUpdate

    class Program
    {
        static void Main(string[] args)
        {
            using (var factory = new ChannelFactory<IConfigurationUpdate>("InfusionProcessorConfigNotification"))
            {
                factory.CreateChannel().SetConfiguration(0.03);
            }
        }
    }
}
