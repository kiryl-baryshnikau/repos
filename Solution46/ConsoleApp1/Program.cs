using System;
using System.Linq;
using System.Security.Claims;

namespace ConsoleApp1
{
    public class Tmp {
        public string Name;
        public Tmp Child;
    }
    class Program
    {
        static void Main(string[] args)
        {
            var v = new Tmp { Name = "A", Child = new Tmp { Name = "B" } };


            Console.WriteLine("Hello World!");
            Console.WriteLine(v?.Name);
            Console.WriteLine(v?.Child?.Name);
            Console.WriteLine(v?.Child?.Child?.Name);

            var a = new ClaimsPrincipal();
            var claims = a.Claims;
            var value = claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value;
            Console.WriteLine("Goodbuy World!");
        }
    }
}
