using System;
using System.Linq;
using System.Data.Entity;

namespace ConsoleApp2
{
    class Program
    {
        static void Main(string[] args)
        {
            //DbProviderFactories.RegisterFactory("System.Data.SqlClient", SqlClientFactory.Instance);

            //var cs = @"server=(localdb)\mssqllocaldb; database=MyContext; Integrated Security=true";
            var cs = @"Data Source=localhost;Initial Catalog=Solution9.ConsoleApp2;integrated security=True;MultipleActiveResultSets=True;App=Solution9.ConsoleApp2;";
            //using (var db = new Context(cs))
            //{
            //    db.Database.CreateIfNotExists();
            //    var person = new Person { Name = "Diego" };
            //    var vehicle = new Vehicle { Name = "Toyota" };
            //    person.Vehicles.Add(vehicle);
            //    db.People.Add(person);
            //    db.SaveChanges();
            //}

            using (var db = new Context(cs))
            {
                Console.WriteLine($"{db.People.Include(item => item.Vehicles).First()?.Name} wrote this sample");
            }
        }
    }
}
