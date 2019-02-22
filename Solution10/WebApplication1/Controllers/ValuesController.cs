using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebApplication1.Controllers
{
    public class LoggingEvents
    {
        public const int GenerateItems = 1000;
        public const int ListItems = 1001;
        public const int GetItem = 1002;
        public const int InsertItem = 1003;
        public const int UpdateItem = 1004;
        public const int DeleteItem = 1005;

        public const int GetItemNotFound = 4000;
        public const int UpdateItemNotFound = 4001;
    }

    //public enum LoEv {
    //    GenerateItems = 1000,
    //    ListItems = 1001,
    //    GetItem = 1002,
    //    InsertItem = 1003,
    //    UpdateItem = 1004,
    //    DeleteItem = 1005
    //}

    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private readonly ILogger Logger;
        public ValuesController(ILogger<ValuesController> logger) {
            Logger = logger;
        }

        // GET api/values
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            using (Logger.BeginScope("CCC"))
            {
                using (Logger.BeginScope("DDD"))
                {
                    Logger.LogInformation(LoggingEvents.ListItems, "EEE");
                }
            }
            using (Logger.BeginScope("FFF"))
            {
            }
            using (Logger.BeginScope("AAA"))
            {
                Logger.LogInformation(LoggingEvents.ListItems, "BBB");
                return new string[] { "value1", "value2" };
            }
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public ActionResult<string> Get(int id)
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
