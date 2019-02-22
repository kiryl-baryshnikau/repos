using Hl7.Fhir.Rest;
using System;

namespace ConsoleApp4
{
    class Program
    {
        static void Main(string[] args)
        {
            var uri = new Uri("");
            var client = new FhirClient(uri);
            var query = new SearchParams();
            var result = client.Search(query);
        }
    }
}
