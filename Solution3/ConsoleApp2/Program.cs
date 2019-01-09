using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.SqlServer;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace ConsoleApp2
{
    class Program
    {
        static void Main(string[] args)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

            var configuration = builder.Build();

            var cache = new Sql​Server​Cache(new SqlServerCacheOptions
            {
                ConnectionString = configuration.GetConnectionString("Solution3"),
                SchemaName = "dbo",
                TableName = "Cache",
            });

            //Console.WriteLine("Press <Enter> to Step 1");
            //Console.ReadLine();
            //cache.SetString("Hello", "World");

            Console.WriteLine("Press <Enter> to Step 2");
            Console.ReadLine();
            var value = cache.GetString("Hello");

            Console.WriteLine(value);
            Console.WriteLine("Press <Enter> to Exit");
            Console.ReadLine();
        }
    }
}
