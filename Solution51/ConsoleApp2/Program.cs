using CareFusion.Infusion.Viewer.InfusionSink;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp2
{
    class Program
    {
        static void Main(string[] args)
        {
            var selfHost = new ServiceHost(typeof(InfusionBusinessService));
            selfHost.Open();
            Console.WriteLine("The service is ready.");
            Console.WriteLine("Press <ENTER> to terminate service.");
            Console.WriteLine();
            Console.ReadLine();
            selfHost.Close();
        }
    }
}
