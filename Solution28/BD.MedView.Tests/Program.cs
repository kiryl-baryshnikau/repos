using BD.MedView.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.MedView.Tests
{
    class Program
    {
        static void Main(string[] args)
        {
            var context = new FacilityContext(new ContextResolver { Activity = Guid.NewGuid(), User = "Test", When = DateTime.Now });
            var facilities = context.Facilities.ToList();
        }
    }
}
