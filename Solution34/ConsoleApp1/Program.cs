using System;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            var value = BasicEncryption.Modules.UserInformation.Instance.Encrypt("Hello World");
            Console.WriteLine(value);
        }
    }
}
