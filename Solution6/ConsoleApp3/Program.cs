using Hl7.Fhir.Model;
using Hl7.Fhir.Serialization;
using System.IO;

namespace ConsoleApp3
{
    class Program
    {
        static void Main(string[] args)
        {
            var pattern = File.ReadAllText(@"order-service-reply.json");
            var parser = new FhirJsonParser();
            var bundle = parser.Parse<Bundle>(pattern);
        }
    }
}
