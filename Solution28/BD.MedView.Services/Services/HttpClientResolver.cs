using BD.MedView.Services.Extensions;
using Common.Logging;
using System;
using System.Net.Http;

namespace BD.MedView.Services.Services
{
    public interface IHttpClientResolver
    {
        HttpClient Resolve();
    }

    public class HttpClientResolver : IHttpClientResolver
    {
        private readonly ILog log;
        public HttpClientResolver(ILog log)
        {
            this.log = log ?? throw new ArgumentNullException(nameof(log));
        }
        public HttpClient Resolve()
        {
            var @default = new HttpClientHandler();
            var handler = new LogDelegatingHandler(log) { InnerHandler = @default };
            var client = new HttpClient(handler);
            //client.DefaultRequestHeaders.Accept.Clear();
            //client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        }
    }
}