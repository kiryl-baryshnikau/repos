using System;
using System.Diagnostics;
using System.Linq;
using System.Data.Entity;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            var search = "a";
            var stopWatch = new Stopwatch();
            stopWatch.Start();
            var data = new Context().UserAccounts.Include(item => item.UserClaims).ToList();
            Console.WriteLine($"fetched {data.Count()}");
            stopWatch.Stop();
            Console.WriteLine(stopWatch.Elapsed);
            stopWatch = new Stopwatch();
            stopWatch.Start();
            var filtered = data.Where(item => item.UserClaims.Any(
                item2 => (item2.Value ?? "").Contains(search)
                )).ToList();
            Console.WriteLine($"fetched { filtered.Count()}");
            stopWatch.Stop();
            Console.WriteLine(stopWatch.Elapsed);
            Console.ReadLine();
        }
    }
}
