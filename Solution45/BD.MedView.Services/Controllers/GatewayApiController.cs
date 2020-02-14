using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace BD.MedView.Services.Controllers
{
    //[Route("api/[controller]")]
    //[ApiController]

    //[Authorize]
    [Route("api/gateway")]
    [ApiController]

    public class GatewayApiController : ControllerBase
    {
        public GatewayApiController()
        {
        }

        //[HttpGet]
        //public async Task<HttpResponseMessage> Get() {
        //    var client = new HttpClient
        //    {
        //        BaseAddress = new Uri("https://www.google.com")
        //    };
        //    var response = await client.GetAsync("search?q=hello");
        //    return response;
        //}

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var client = new HttpClient
            {
                BaseAddress = new Uri("https://www.google.com")
            };
            var response = await client.GetAsync("search?q=hello");
            this.HttpContext.Response.RegisterForDispose(response);
            return new HttpResponseMessageResult(response);
        }

        //public class HttpResponseMessageResult : IActionResult
        //{
        //    private readonly HttpResponseMessage _responseMessage;

        //    public HttpResponseMessageResult(HttpResponseMessage responseMessage)
        //    {
        //        _responseMessage = responseMessage; // could add throw if null
        //    }

        //    public async Task ExecuteResultAsync(ActionContext context)
        //    {
        //        context.HttpContext.Response.StatusCode = (int)_responseMessage.StatusCode;

        //        foreach (var header in _responseMessage.Headers)
        //        {
        //            context.HttpContext.Response.Headers.TryAdd(header.Key, new StringValues(header.Value.ToArray()));
        //        }

        //        using (var stream = await _responseMessage.Content.ReadAsStreamAsync())
        //        {
        //            await stream.CopyToAsync(context.HttpContext.Response.Body);
        //            await context.HttpContext.Response.Body.FlushAsync();
        //        }
        //    }
        //}

        public class HttpResponseMessageResult : IActionResult
        {
            private readonly HttpResponseMessage _responseMessage;

            public HttpResponseMessageResult(HttpResponseMessage responseMessage)
            {
                _responseMessage = responseMessage; // could add throw if null
            }

            public async Task ExecuteResultAsync(ActionContext context)
            {
                var response = context.HttpContext.Response;


                if (_responseMessage == null)
                {
                    var message = "Response message cannot be null";

                    throw new InvalidOperationException(message);
                }

                using (_responseMessage)
                {
                    response.StatusCode = (int)_responseMessage.StatusCode;

                    var responseFeature = context.HttpContext.Features.Get<IHttpResponseFeature>();
                    if (responseFeature != null)
                    {
                        responseFeature.ReasonPhrase = _responseMessage.ReasonPhrase;
                    }

                    var responseHeaders = _responseMessage.Headers;

                    // Ignore the Transfer-Encoding header if it is just "chunked".
                    // We let the host decide about whether the response should be chunked or not.
                    if (responseHeaders.TransferEncodingChunked == true &&
                        responseHeaders.TransferEncoding.Count == 1)
                    {
                        responseHeaders.TransferEncoding.Clear();
                    }

                    foreach (var header in responseHeaders)
                    {
                        response.Headers.Append(header.Key, header.Value.ToArray());
                    }

                    if (_responseMessage.Content != null)
                    {
                        var contentHeaders = _responseMessage.Content.Headers;

                        // Copy the response content headers only after ensuring they are complete.
                        // We ask for Content-Length first because HttpContent lazily computes this
                        // and only afterwards writes the value into the content headers.
                        var unused = contentHeaders.ContentLength;

                        foreach (var header in contentHeaders)
                        {
                            response.Headers.Append(header.Key, header.Value.ToArray());
                        }

                        await _responseMessage.Content.CopyToAsync(response.Body);
                    }
                }
            }
        }
    }
}