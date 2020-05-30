// Decompiled with JetBrains decompiler
// Type: CareFusion.Infusion.Viewer.ServiceUtilities.ServiceErrorHandler
// Assembly: CareFusion.Infusion.Viewer.ServiceUtilities, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 9C257DD2-0FC1-461F-9741-AD5B5740BD8F
// Assembly location: C:\Users\822616\Desktop\CmsProcessor\CareFusion.Infusion.Viewer.ServiceUtilities.dll

//using log4net;
using System;
using System.ServiceModel.Channels;
using System.ServiceModel.Dispatcher;

namespace CareFusion.Infusion.Viewer.ServiceUtilities
{
    public class ServiceErrorHandler : IErrorHandler
    {
        //private ILog logger = LogManager.GetLogger(typeof(ServiceErrorHandler));

        public void ProvideFault(Exception error, MessageVersion version, ref Message fault)
        {
            //this.logger.ErrorFormat("Service detected a WCF Fault, fault passed back to caller. Exception: {0}.", (object)error.ToString());
        }

        public bool HandleError(Exception error)
        {
            //if (this.logger.IsWarnEnabled)
            //    this.logger.WarnFormat("Service detected an unhandled error. Exception: {0}", (object)error.ToString());
            return false;
        }
    }
}
