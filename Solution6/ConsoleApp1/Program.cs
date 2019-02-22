using Hl7.Fhir.Rest;
using Hl7.Fhir.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            var uri = new Uri("http://localhost");
            var client = new FhirClient(uri);
            //var searchParam = new MedicationOrder
            //client.Search()
        }
    }
}
