using System;
using System.Collections.Generic;
using System.Linq;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            //throw new DuplicateKeyException();

            var dict = new Dictionary<string, string>();
            dict.Add("a", "a");
            dict.Add("a", "b");

            Console.WriteLine("Hello World!");
        }
    }
}
