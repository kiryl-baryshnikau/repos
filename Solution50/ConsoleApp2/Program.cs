using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp2
{
    class Program
    {
        static void Main(string[] args)
        {
            var db = new Context();
            var query = db.vw_ContainerAndGrwarnings.AsNoTracking() as IQueryable<ContainerAndGuardrailWarnings>;
            var facilityList = new[] { "00000000000000000000000000000000", "910001", "910000", "900300", "910004" };
            var query1 = query.Where(p => facilityList.Contains(p.AdtFacility.ToLower()));
            var pattern1 = query1.ToString();
            var query2 = query.Where(p => facilityList.Contains(p.AdtFacility));
            var pattern2 = query2.ToString();
            
            //var query3 = query.Where(p => facilityList.Contains(p.AdtFacility, StringComparer.OrdinalIgnoreCase));
            //var pattern3 = query3.ToString();
            
            var query4 = query.Where(p => facilityList.Any(k => k.Equals(p.AdtFacility, StringComparison.InvariantCultureIgnoreCase)));
            var pattern4 = query4.ToString();
            var query5 = query.Where(p => facilityList.FirstOrDefault(k => k.Equals(p.AdtFacility, StringComparison.InvariantCultureIgnoreCase)) != null);
            var pattern5 = query5.ToString();
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            query4.ToList();
            stopwatch.Stop();
            Console.WriteLine(stopwatch.Elapsed);
        }
    }
}
