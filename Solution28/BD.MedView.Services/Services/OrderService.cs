using BD.MedView.Services.Extensions;
using Common.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;

namespace BD.MedView.Services.Services
{
    public class OrderServiceOptions
    {
        public Uri BaseAddress { get; set; }
    }

    public class OrderService : IOrderService
    {
        private readonly IOptions<OrderServiceOptions> options;
        private readonly ILog log;
        private readonly IHttpClientResolver httpClientResolver;
        private readonly IAccessTokenResolver accessTokenResolver;

        public OrderService(
            IOptions<OrderServiceOptions> options, 
            ILog log, 
            IHttpClientResolver httpClientResolver, 
            IAccessTokenResolver accessTokenResolver)
        {
            this.options = options ?? throw new ArgumentNullException(nameof(options));
            this.log = log ?? throw new ArgumentNullException(nameof(log));
            this.httpClientResolver = httpClientResolver ?? throw new ArgumentNullException(nameof(httpClientResolver));
            this.accessTokenResolver = accessTokenResolver ?? throw new ArgumentNullException(nameof(accessTokenResolver));
        }

        public MedicalOrderSearchResult Search(MedicalOrderSearchQuery request)
        {
            using (log.Activity(m => m($"Searching")))
            {
                var query = HttpUtility.ParseQueryString(string.Empty);
                var queryString = query.ToString();
                var requestUri = "fhir/MedicationOrder/_search/" + (queryString == string.Empty ? string.Empty : "?") + queryString;

                var client = httpClientResolver.Resolve();
                client.BaseAddress = options.Value.BaseAddress;
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var token = this.accessTokenResolver.Resolve();
                if (!string.IsNullOrWhiteSpace(token))
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var result = client.PostAsJsonAsync(requestUri, request).Result;

                //Compensate 404 instead of enpty reply
                if (result.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new MedicalOrderSearchResult
                    {
                        resourceType = "Bundle",
                        type = "searchset",
                        entry = Enumerable.Empty<MedicalOrderSearchResult.Entry>().ToList()
                    };
                }
                result.EnsureSuccessStatusCode();
                var value = result.Content.ReadAsAsync<MedicalOrderSearchResult>().Result;
                return value;
            }
        }
    }
}