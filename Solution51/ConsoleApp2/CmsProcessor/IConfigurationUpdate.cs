// Decompiled with JetBrains decompiler
// Type: CareFusion.Infusion.Viewer.Contract.IConfigurationUpdate
// Assembly: InfusionViewer.Contract, Version=1.1.0.24, Culture=neutral, PublicKeyToken=null
// MVID: B7D7DB6A-BDFA-4302-98A4-A635125925B7
// Assembly location: C:\Users\822616\Desktop\CmsProcessor\InfusionViewer.Contract.dll

using System.ServiceModel;

namespace CareFusion.Infusion.Viewer.Contract
{
    [ServiceContract(Namespace = "http://carefusion.com/infusion/viewer/RxProcessor/")]
    public interface IConfigurationUpdate
    {
        [OperationContract]
        void SetConfiguration(double tolerance);
    }
}
