using BD.MedView.Services.Extensions;
using Common.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;

namespace BD.MedView.Services.Services
{
    #region Interface
    #region AlertSummary
    public class AlertSummary
    {
        //public class Status
        //{
        //    public string status { get; set; }
        //    public int count { get; set; }
        //}

        //public class Priority
        //{
        //    public string priority { get; set; }
        //    public int @new { get; set; }
        //    public int read { get; set; }
        //    public int pending { get; set; }
        //    public int documented { get; set; }
        //}

        //public class Unit
        //{
        //    public string location { get; set; }
        //    public string bed { get; set; }
        //}

        public class Summary
        {
            public string category { get; set; }
            public string title { get; set; }
            public int facility_id { get; set; }
            public int total_alerts { get; set; }
            //public List<Status> statuses { get; set; }
            //public List<Priority> priorities { get; set; }
            public string ownership { get; set; }
            //public DateTime updated_on { get; set; }
            //public List<Unit> units { get; set; }
        }

        public List<Summary> summaries { get; set; }
    }
    #endregion

    #region AlertHeader
    public class AlertHeader
    {
        public class Patient
        {
            //public string name { get; set; }
            public string account_number { get; set; }
            public string mrn { get; set; }
            //public string born_on { get; set; }
            //public string location { get; set; }
            //public string bed { get; set; }
        }

        public class Drug
        {
            public string prescription_number { get; set; }
            public string placer_order_number { get; set; }
            //public string drug { get; set; }
            //public DateTime started_on { get; set; }
            //public DateTime stopped_on { get; set; }
            //public int days { get; set; }
            //public string route { get; set; }
            //public string mapped_route { get; set; }
            //public double give_per { get; set; }
            //public double give_rate_amount { get; set; }
            //public string give_rate_units { get; set; }
            //public double give_strength { get; set; }
            //public string give_strength_units { get; set; }
            //public string give_strength_volume_units { get; set; }
            //public string ordering_physician { get; set; }
            //public string med_id { get; set; }
        }

        public class Alert
        {
            public int alert_id { get; set; }
            public int facility_id { get; set; }
            //public string priority { get; set; }
            public string status { get; set; }
            //public string ownership { get; set; }
            //public DateTime created_on { get; set; }
            //public DateTime updated_on { get; set; }
            public Patient patient { get; set; }
            public List<Drug> drugs { get; set; }
        }

        public class Results
        {
            public int page_number { get; set; }
            public int page_size { get; set; }
            public string category { get; set; }
            public string title { get; set; }
            public List<Alert> alerts { get; set; }
        }

        public Results results { get; set; }
    }
    #endregion

    //https://vsi.medmined.com/HSVIntegration/v1/
    public interface IHsvIntegrationService
    {
        //GET https://vsi.medmined.com/HSVIntegration/v1/AlertSummary?FacilityKeys={FacilityKeys}
        AlertSummary GetAlertSummary(int[] facilityKeys);

        //GET https://vsi.medmined.com/HSVIntegration/v1/AlertHeader?FacilityKeys={FacilityKeys}&Title={Title}&Category={Category}&Start={Start}&Limit={Limit}&Ownership={Ownership}
        AlertHeader GetAlertHeader(int[] facilityKeys, string category, string title, int? start, int? limit, string ownership);
    }
    #endregion

    #region Options
    public class HsvIntegrationServiceOptions
    {
        public Uri BaseAddress { get; set; }
    }
    #endregion Options

    public class HsvIntegrationService : IHsvIntegrationService
    {
        private readonly IOptions<HsvIntegrationServiceOptions> options;
        private readonly ILog log;
        private readonly IHttpClientResolver httpClientResolver;
        private readonly IAccessTokenResolver accessTokenResolver;

        public HsvIntegrationService(
            IOptions<HsvIntegrationServiceOptions> options, 
            ILog log, 
            IHttpClientResolver httpClientResolver, 
            IAccessTokenResolver accessTokenResolver)
        {
            this.options = options ?? throw new ArgumentNullException(nameof(options));
            this.log = log ?? throw new ArgumentNullException(nameof(log));
            this.httpClientResolver = httpClientResolver ?? throw new ArgumentNullException(nameof(httpClientResolver));
            this.accessTokenResolver = accessTokenResolver ?? throw new ArgumentNullException(nameof(accessTokenResolver));
        }

        public AlertSummary GetAlertSummary(int[] facilityKeys)
        {
            if (facilityKeys == null)
            {
                throw new ArgumentNullException(nameof(facilityKeys));
            }
            if (facilityKeys.Length == 0)
            {
                throw new ArgumentException("Array should have at lease one element", nameof(facilityKeys));
            }

            using (log.Activity(m => m($"Getting AlertSummary for {nameof(facilityKeys)}[{string.Join(",", facilityKeys)}]")))
            {
                var query = HttpUtility.ParseQueryString(string.Empty);
                query["FacilityKeys"] = string.Join(",", facilityKeys);
                var queryString = query.ToString();
                var requestUri = "v1/AlertSummary" + (queryString == string.Empty ? string.Empty : "?") + queryString;

                var client = httpClientResolver.Resolve();
                client.BaseAddress = options.Value.BaseAddress;
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var token = this.accessTokenResolver.Resolve();
                if (!string.IsNullOrWhiteSpace(token))
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var result = client.GetAsync(requestUri).Result;
                result.EnsureSuccessStatusCode();
                var value = result.Content.ReadAsAsync<AlertSummary>().Result;
                return value;
            }
        }

        public AlertHeader GetAlertHeader(int[] facilityKeys,string category,string title,int? start,int? limit,string ownership)
        {

            if (facilityKeys == null)
            {
                throw new ArgumentNullException(nameof(facilityKeys));
            }
            if (facilityKeys.Length == 0)
            {
                throw new ArgumentException("Array should have at lease one element", nameof(facilityKeys));
            }

            if (category == null)
            {
                throw new ArgumentNullException(nameof(category));
            }
            if (!(0 < category.Length && category.Length <= 100))
            {
                throw new ArgumentException("Value length must be in range 1..100", nameof(category));
            }

            if (title == null)
            {
                throw new ArgumentNullException(nameof(title));
            }
            if (!(1 <= title.Length && title.Length <= 100))
            {
                throw new ArgumentException("Value.Length must be in range 1..100", nameof(title));
            }

            if (start.HasValue)
            {
                if (!(1 <= start.Value))
                {
                    throw new ArgumentException("Value must be in range 1..100", nameof(start));
                }
            }

            if (limit.HasValue)
            {
                if (!(10 <= limit.Value && limit.Value <= 1000))
                {
                    throw new ArgumentException("Value must be in range 10..1000", nameof(limit));
                }
            }

            if (ownership != null)
            {
                if (!(0 <= ownership.Length && ownership.Length <= 25))
                {
                    throw new ArgumentException("Value.Length must be in range 0..25", nameof(ownership));
                }
            }

            using (log.Activity(m => m($"Getting GetAlertHeader for {nameof(facilityKeys)}[{string.Join(",", facilityKeys)}], {nameof(category)}:{category}, {nameof(title)}:{title}, {nameof(start)}:{start}, {nameof(limit)}:{limit}, {nameof(ownership)}:{ownership}")))
            {
                var query = HttpUtility.ParseQueryString(string.Empty);
                query["FacilityKeys"] = string.Join(",", facilityKeys);
                query["Category"] = category;
                query["Title"] = title;
                if (start.HasValue)
                {
                    query["Start"] = start.Value.ToString();
                }
                if (limit.HasValue)
                {
                    query["Limit"] = limit.Value.ToString();
                }
                if (ownership != null)
                {
                    query["Ownership"] = ownership;
                }
                var queryString = query.ToString();
                var requestUri = "v1/AlertHeader" + (queryString == string.Empty ? string.Empty : "?") + queryString;

                var client = httpClientResolver.Resolve();
                client.BaseAddress = options.Value.BaseAddress;
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var token = this.accessTokenResolver.Resolve();
                if (!string.IsNullOrWhiteSpace(token))
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var result = client.GetAsync(requestUri).Result;

                result.EnsureSuccessStatusCode();
                var value = result.Content.ReadAsAsync<AlertHeader>().Result;
                return value;
            }
        }
    }
}