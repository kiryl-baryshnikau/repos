// Decompiled with JetBrains decompiler
// Type: CareFusion.Infusion.Viewer.ServiceUtilities.ServiceErrorHandlerBehavior
// Assembly: CareFusion.Infusion.Viewer.ServiceUtilities, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: 9C257DD2-0FC1-461F-9741-AD5B5740BD8F
// Assembly location: C:\Users\822616\Desktop\CmsProcessor\CareFusion.Infusion.Viewer.ServiceUtilities.dll

using System;
using System.ServiceModel.Configuration;

namespace CareFusion.Infusion.Viewer.ServiceUtilities
{
    public class ServiceErrorHandlerBehavior : BehaviorExtensionElement
    {
        protected override object CreateBehavior()
        {
            return (object)new ServiceErrorBehavior();
        }

        public override Type BehaviorType
        {
            get
            {
                return typeof(ServiceErrorBehavior);
            }
        }
    }
}
