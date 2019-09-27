using Common.Logging;
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace BD.MedView.Services.Extensions
{
    public class LogDelegatingHandler : DelegatingHandler
    {
        private readonly ILog log;

        public LogDelegatingHandler(ILog log)
        {
            this.log = log ?? throw new ArgumentNullException(nameof(log));
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            log.Trace(m => m("Request.RequestUri:{0}", request.RequestUri));
            //log.Trace(m => m("Request.Headers.Authorization:{0}", request.Headers.Authorization));
            log.Trace(m => m("Request.Method:{0}", request.Method));
            if (request.Content != null)
            {
                var requestBody = await request.Content.ReadAsStringAsync();
                log.Trace(m => m("Request.Content:{0}", requestBody));
            }

            var response = await base.SendAsync(request, cancellationToken);

            log.Trace(m => m("Response.StatusCode:{0}", response.StatusCode));
            if (response.Content != null)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                log.Trace(m => m("Response.Content:{0}", responseBody));
            }

            return response;
        }
    }

}
