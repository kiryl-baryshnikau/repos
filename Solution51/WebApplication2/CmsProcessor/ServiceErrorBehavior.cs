// Decompiled with JetBrains decompiler
// Type: CareFusion.Infusion.Viewer.ServiceUtilities.ServiceErrorBehavior
// Assembly: CareFusion.Infusion.Viewer.ServiceUtilities, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 9C257DD2-0FC1-461F-9741-AD5B5740BD8F
// Assembly location: C:\Users\822616\Desktop\CmsProcessor\CareFusion.Infusion.Viewer.ServiceUtilities.dll

using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.ServiceModel.Description;
using System.ServiceModel.Dispatcher;

namespace CareFusion.Infusion.Viewer.ServiceUtilities
{
    public class ServiceErrorBehavior : IServiceBehavior
    {
        public void Validate(ServiceDescription serviceDescription, ServiceHostBase serviceHostBase)
        {
        }

        public void AddBindingParameters(
          ServiceDescription serviceDescription,
          ServiceHostBase serviceHostBase,
          Collection<ServiceEndpoint> endpoints,
          BindingParameterCollection bindingParameters)
        {
        }

        public void ApplyDispatchBehavior(
          ServiceDescription serviceDescription,
          ServiceHostBase serviceHostBase)
        {
            ServiceErrorHandler serviceErrorHandler = new ServiceErrorHandler();
            foreach (ChannelDispatcher channelDispatcher in (SynchronizedCollection<ChannelDispatcherBase>)serviceHostBase.ChannelDispatchers)
                channelDispatcher.ErrorHandlers.Add((IErrorHandler)serviceErrorHandler);
        }
    }
}
