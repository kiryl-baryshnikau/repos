using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebApplication2.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            //return View();
            //var ret = System.IO.Directory.Exists(@"D:\Home\LogFiles\");
            var ret = System.IO.Directory.Exists(@"D:\Home\LogFiles");
            //Console.WriteLine(ret);
            return Content(ret.ToString());
        }
    }
}