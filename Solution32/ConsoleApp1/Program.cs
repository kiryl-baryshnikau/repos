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
            //var ret = System.IO.Directory.Exists(@"D:\Home\LogFiles");
            var ret = System.IO.Directory.Exists(@"D:\Home\LogFiles\");
            Console.WriteLine(ret);
        }
    }
}
