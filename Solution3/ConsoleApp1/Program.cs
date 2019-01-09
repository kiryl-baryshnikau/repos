using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.SqlServer;
using System;
using System.Configuration;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            var cache = new Sql​Server​Cache(new SqlServerCacheOptions {
                ConnectionString = ConfigurationManager.ConnectionStrings["Solution3"].ConnectionString,
                SchemaName = "dbo",
                TableName = "Cache",
            });

            Console.WriteLine("Press <Enter> to Step 1");
            Console.ReadLine();
            cache.SetString("Hello", "World");

            Console.WriteLine("Press <Enter> to Step 2");
            Console.ReadLine();
            var value = cache.GetString("Hello");

            Console.WriteLine(value);
            Console.WriteLine("Press <Enter> to Exit");
            Console.ReadLine();
        }
    }
}
