using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using System;


namespace BD.MedView.Services.Controllers
{
    //TODO: KB: Core 3.1 Required fault contract !!!!
    public static class ControllerBaseExtensions
    {
        public static ActionResult InternalServerError(this ControllerBase obj, Exception e) 
        {
            return new InternalServerErrorResult(e);
        }

        public class InternalServerErrorResult : ObjectResult
        {
            public InternalServerErrorResult(Exception e) : base(Filter(e))
            {
                StatusCode = StatusCodes.Status500InternalServerError;
            }

            private static object Filter(Exception e) 
            {
                return new
                {
                    Message = "An error has occured.",
                    ExceptionMessage = e.Message,
                    ExceptionType = e.GetType().FullName,
                    StackTrace = e.StackTrace
                };
            }
        }
    }
}
