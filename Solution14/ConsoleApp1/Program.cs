using Newtonsoft.Json;
using System.Collections.Generic;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            var value = @"
{
    ""OrderServiceVariance"":50,
    ""OrderServiceIdMapping"": {
        ""MRN"":""MMMRRRNNN""
    }
}";
            var obj = JsonConvert.DeserializeAnonymousType(value, new { OrderServiceVariance = 0, OrderServiceIdMapping = new Dictionary<string, string>()});

        }
    }
}
