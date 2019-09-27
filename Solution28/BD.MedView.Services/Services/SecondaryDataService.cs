using BD.MedView.Services.Extensions;
using BD.MedView.Services.Models;
using Common.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BD.MedView.Services.Services
{
    public static class IdKind
    {
        public const string MRN = "MRN";
        public const string AccountNumber = "AccountNumber";
        public const string VisitNumber = "VisitNumber";
        public const string EncounterNumber = "EncounterNumber";
    }

    public class SecondaryDataServiceOptions
    {
        public const int DefaultVariance = 10;
        public const int DefaultMaxLimit = 1000;
        public const int DefaultMaxDegreeOfParallelism = 8;

        public TimeSpan? CacheAbsoluteExpiration { get; set; }
        public TimeSpan? CacheSlidingExpiration { get; set; }
        public int Variance { get; set; } = DefaultVariance;
        public int MaxLimit { get; set; } = DefaultMaxLimit;
        public int MaxDegreeOfParallelism { get; set; } = DefaultMaxDegreeOfParallelism;
        public Dictionary<string, string> IdKindMapping { get; set; } = new Dictionary<string, string> {
            { IdKind.MRN, "MRN" },
            { IdKind.AccountNumber, "AN" },
            { IdKind.EncounterNumber, "EN" },
            { IdKind.VisitNumber, "VN" }
        };
    }

    public class SecondaryDataService : ISecondaryDataService
    {
        public class Drug
        {
            public string prescription_number { get; set; }
            //public object placer_order_number { get; set; }
            public string placer_order_number { get; set; }
            //public string drug { get; set; }
            //public DateTime started_on { get; set; }
            //public double give_rate_amount { get; set; }
            //public string give_rate_units { get; set; }
            //public string med_id { get; set; }
        }

        public class Alert
        {
            public int alert_id { get; set; }
            public string alert_category { get; set; }
            public string alert_title { get; set; }
            public int facility_id { get; set; }
            public string patient_account_number { get; set; }
            public string patient_mrn { get; set; }
            public Drug[] drugs { get; set; }
            public string status { get; set; }
        }

        private readonly IOptions<SecondaryDataServiceOptions> options;
        private readonly ILog log;
        private readonly ICacheService cacheService;
        private readonly IOrderService orderService;
        private readonly IHsvIntegrationService medMinedService;
        public SecondaryDataService(
            IOptions<SecondaryDataServiceOptions> options, 
            ILog log, 
            ICacheService cacheService, 
            IOrderService orderService, 
            IHsvIntegrationService medMinedService)
        {
            this.options = options ?? throw new ArgumentNullException(nameof(options));
            this.log = log ?? throw new ArgumentNullException(nameof(log));
            this.cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            this.orderService = orderService ?? throw new ArgumentNullException(nameof(orderService));
            this.medMinedService = medMinedService ?? throw new ArgumentNullException(nameof(medMinedService));
        }

        public void Process(SecondaryData value)
        {
            value = value ?? throw new ArgumentNullException(nameof(value));

            using (log.Activity(m => m($"Process {nameof(SecondaryData)} by {Thread.CurrentPrincipal?.Identity?.Name}")))
            {
                using (log.Activity(m => m("Preparing PageInfo and Cache")))
                {
                    try
                    {
                        var refreshCacheTask = Task.Run(() => Cache(value));
                        var enrichPageInfoTask = Task.Run(() => Enrich(value));
                        Task.WaitAll(refreshCacheTask, enrichPageInfoTask);
                    }
                    catch (Exception e)
                    {
                        log.Error($"Preparing PageInfo and Cache Error", e);
                        throw;
                    }
                }

                var pageInfoList = null as List<PageInfo>;
                using (log.Activity(m => m($"Filtering {nameof(PageInfo)} that cannot be matched")))
                {
                    pageInfoList = value.PageInfoList.PageInfo
                        .Where(item => CanMatch(item))
                        .ToList();

                    log.Trace(m => m($"Ignored {nameof(PageInfo)} [{string.Join(",", value.PageInfoList.PageInfo.Except(pageInfoList).Select(item => item.MedMinedfacilityId))}]"));
                }

                var alertList = null as List<Alert>;
                using (log.Activity(m => m($"Get {nameof(Alert)} from Cache")))
                {
                    alertList = pageInfoList
                        .Select(item => int.Parse(item.MedMinedfacilityId))
                        .Distinct()
                        .SelectMany(item => GetAlertsFromCache(item) ?? Enumerable.Empty<Alert>())
                        .ToList();

                    log.Trace(m => m($"Found {nameof(Alert)} for {nameof(Alert.facility_id)} [{string.Join(",", alertList.Select(item => item.facility_id).Distinct())}]"));
                }

                using (log.Activity(m => m($"Matching {nameof(PageInfo)} to {nameof(Alert)}")))
                {
                    var pageInfoAlerts = pageInfoList.Join(alertList,
                        (pageInfo) => pageInfo.MedMinedfacilityId,
                        (alert) => alert.facility_id.ToString(),
                        (pageInfo, alert) => Tuple.Create(pageInfo, alert));

                    foreach (var pageInfoAlert in pageInfoAlerts)
                    {
                        var pageInfo = pageInfoAlert.Item1;
                        var alert = pageInfoAlert.Item2;

                        var isMatched = default(bool);
                        using (log.Activity(m => m($"Matching {nameof(PageInfo)}[{pageInfo.Id}] to {nameof(Alert)}[{alert.alert_id}]")))
                        {
                            isMatched = Match(pageInfo, alert);
                            log.Trace(m => m($"Match" + (isMatched ? " " : " not ") + $"found for {nameof(PageInfo)}[{pageInfo.Id}] to {nameof(Alert)}[{alert.alert_id}]"));
                        }

                        if (isMatched)
                        {
                            using (log.Activity(m => m($"Adding {nameof(Alert)}[{alert.alert_id}] to {nameof(PageInfo)}[{pageInfo.Id}].{nameof(PageInfo.MedMinedAlert)}")))
                            {
                                Fill(pageInfo, alert);
                                log.Trace(m => m($"Added {nameof(Alert)}[{alert.alert_id}] to {nameof(PageInfo)}[{pageInfo.Id}].{nameof(PageInfo.MedMinedAlert)}"));
                            }
                        }
                    }
                }

                log.Info(m => m($"Processed {nameof(SecondaryData)} by {Thread.CurrentPrincipal?.Identity?.Name}"));
            }
        }

        private void Cache(SecondaryData value)
        {
            using (log.Activity(m => m($"Caching Alerts")))
            {
                var facilityKeys = null as int[];
                using (log.Activity(m => m($"Lookup for {nameof(PageInfo)}.{nameof(PageInfo.MedMinedfacilityId)}")))
                {
                    facilityKeys = value
                        .PageInfoList
                        .PageInfo
                        .Select(item => item.MedMinedfacilityId)
                        .Distinct()
                        .Select(item => Int32.Parse(item))
                        .Where(item => GetAlertsFromCache(item) == null)
                        .ToArray();
                    log.Trace(m => m($"Found facilityKeys:[{string.Join(",", facilityKeys)}]"));
                }

                if (!facilityKeys.Any())
                {
                    log.Trace(m => m($"No uncached {nameof(facilityKeys)} found: exit"));
                    return;
                }

                var alerts = null as List<Alert>;
                using (log.Activity(m => m($"Loading {nameof(Alert)} from service")))
                {
                    alerts = GetAlertsFromService(facilityKeys);
                    log.Trace(m => m($"Found {nameof(Alert)}:[{string.Join(",", alerts.Select(item => item.alert_id))}]"));
                }
                if (!alerts.Any())
                {
                    log.Trace(m => m($"No {nameof(Alert)} found: exit"));
                    return;
                }

                var cacheItems = null as Dictionary<int, List<Alert>>;
                using (log.Activity(m => m($"Prepare {nameof(cacheItems)}")))
                {
                    //prepareForCache
                    cacheItems = alerts
                        .GroupBy(item => item.facility_id)
                        .ToDictionary(item => item.Key, item => item.ToList());

                    //TODO: KB: Shold we trace results?
                    log.Trace(m => m($"Cache entires are prepared"));
                }

                if (!cacheItems.Keys.Any())
                {
                    log.Trace(m => m($"No {nameof(cacheItems)} found: exit"));
                    return;
                }

                using (log.Activity(m => m($"Cache {nameof(cacheItems)}")))
                {
                    foreach (var item in cacheItems)
                    {
                        SetAlertsToCache(item.Key, item.Value);
                    }
                }
            }
        }

        private void Enrich(SecondaryData value)
        {
            using (log.Activity(m => m($"Enriching PageInfo")))
            {
                var pageInfoList = null as List<PageInfo>;
                using (log.Activity(m => m($"Filtering un-enriched {nameof(PageInfo)}")))
                {
                    pageInfoList = value.PageInfoList.PageInfo
                        .Where(item => (!CanMatch(item)) && (CanEnrich(item)))
                        .ToList();

                    log.Trace(m => m($"Ignored {nameof(PageInfo)} [{string.Join(",", value.PageInfoList.PageInfo.Except(pageInfoList).Select(item => item.MedMinedfacilityId))}]"));
                }

                if (!pageInfoList.Any())
                {
                    log.Trace(m => m($"No {nameof(PageInfo)} with missing required fields are found: exit"));
                    return;
                }

                var ordersNumberPerPageInfo = null as Dictionary<Guid, (List<string> PlacerOrderNumbers, List<IdInfo> IdInfos)>;
                using (log.Activity(m => m($"Getting {nameof(PageInfo)}.{nameof(PageInfo.Id)} to {nameof(PageInfo.EnrichedPlacerOrderNumbers)}[] association")))
                {
                    ordersNumberPerPageInfo = GetEnrichmentFromService(pageInfoList);
                }

                using (log.Activity(m => m($"Enriching {nameof(PageInfo)}")))
                {
                    foreach (var pageInfo in pageInfoList)
                    {
                        using (log.Activity(m => m($"Enriching {nameof(PageInfo)}[{pageInfo.Id}]")))
                        {
                            if (ordersNumberPerPageInfo.TryGetValue(pageInfo.Id, out (List<string> PlacerOrderNumbers, List<IdInfo> IdInfos) missingFields))
                            {
                                if (missingFields.PlacerOrderNumbers.Any())
                                {
                                    pageInfo.EnrichedPlacerOrderNumbers = missingFields.PlacerOrderNumbers;
                                    log.Trace(m => m($"Enriched {nameof(PageInfo)}[{pageInfo.Id}] with Order Numbers [{string.Join(",", pageInfo.EnrichedPlacerOrderNumbers)}]"));
                                }
                                if (missingFields.IdInfos.Any())
                                {
                                    pageInfo.EnrichedIdInfos = missingFields.IdInfos;
                                    log.Trace(m => m($"Enriched {nameof(PageInfo)}[{pageInfo.Id}] with IdInfos [{string.Join(",", pageInfo.EnrichedIdInfos.Select(item => $"{item.IdKind}:{item.Value}"))}]"));
                                }
                            }
                            else
                            {
                                log.Trace(m => m($"Enriching {nameof(PageInfo)}[{pageInfo.Id}] cannot be done"));
                            }
                        }
                    }
                }

            }
        }

        private List<Alert> GetAlertsFromCache(int facilityKey)
        {
            using (log.Activity(m => m($"Getting Alerts from Cache by key {facilityKey}")))
            {
                try
                {
                    var result = cacheService.GetObject<List<Alert>>(facilityKey.ToString());
                    //TODO: KB: Shold we trace results?
                    log.Trace(m => m($"Getting Alerts from Cache by key {facilityKey} succeded: {(result != null ? string.Join(", ", result.Select(item => item.alert_id)) : null)}"));
                    return result;
                }
                catch (Exception ex)
                {
                    log.Error(m => m($"Getting Alerts from Cache by key {facilityKey} failure"), ex);
                    throw;
                }
            }
        }

        private void SetAlertsToCache(int facilityKey, List<Alert> alerts)
        {
            using (log.Activity(m => m($"Setting Alerts [{string.Join(",", alerts.Select(item => item.alert_id))}] to Cache with key {facilityKey}")))
            {
                try
                {
                    var options = new CacheServiceOptions
                    {
                        AbsoluteExpirationRelativeToNow = this.options.Value.CacheAbsoluteExpiration,
                        SlidingExpiration = this.options.Value.CacheSlidingExpiration,
                    };
                    cacheService.SetObject(facilityKey.ToString(), alerts, options);
                    //TODO: KB: Shold we trace results?
                    log.Trace(m => m($"Setting Alerts[{string.Join(",", alerts.Select(item => item.alert_id))}] to Cache with key {facilityKey} succeded"));
                }
                catch (Exception ex)
                {
                    log.Error(m => m($"Setting Alerts[{string.Join(",", alerts.Select(item => item.alert_id))}] to Cache with key {facilityKey} failure"), ex);
                    throw;
                }
            }
        }

        private List<Alert> GetAlertsFromService(int[] facilityKeys)
        {
            using (log.Activity(m => m($"Getting Alerts from Service with {nameof(facilityKeys)} [{string.Join(",", facilityKeys)}]")))
            {
                var summaries = null as AlertSummary;
                using (log.Activity(m => m($"Getting AlertSummary for {nameof(facilityKeys)} [{string.Join(",", facilityKeys)}]")))
                {
                    try
                    {
                        summaries = medMinedService.GetAlertSummary(facilityKeys);
                        log.Info(m => m($"Getting AlertSummary for {nameof(facilityKeys)} [{string.Join(",", facilityKeys)}] success"));
                    }
                    catch (Exception ex)
                    {
                        log.Error(m => m($"Getting AlertSummary for {nameof(facilityKeys)} [{string.Join(",", facilityKeys)}] failure"), ex);
                        throw;
                    }
                }
                if (!summaries.summaries.Any())
                {
                    log.Trace(m => m($"No {nameof(AlertSummary)} found: exit"));
                    return Enumerable.Empty<Alert>().ToList();
                }


                var alertHeaders = null as List<AlertHeader>;
                using (log.Activity(m => m($"Getting {nameof(AlertHeader)}")))
                {
                    var getAlertHeaderArgs = summaries
                        .summaries
                        .GroupBy(item => Tuple.Create(item.category, item.title, item.ownership), item => new { item.facility_id, item.total_alerts })
                        .Select(item => new { category = item.Key.Item1, title = item.Key.Item2, ownership = item.Key.Item3, facilityKeys = item.Select(item2 => item2.facility_id).ToArray(), totalCount = item.Select(item2 => item2.total_alerts).Sum() })
                        .SelectMany(item =>
                            Enumerable.Range(0, item.totalCount / options.Value.MaxLimit + 1).Select(start => new
                            {
                                item.facilityKeys,
                                item.category,
                                item.title,
                                // start is page number
                                start = start + 1,
                                limit = options.Value.MaxLimit,
                                item.ownership
                            }))
                        .ToList();

                    alertHeaders = new List<AlertHeader>();
                    Parallel.ForEach(getAlertHeaderArgs, new ParallelOptions { MaxDegreeOfParallelism = options.Value.MaxDegreeOfParallelism }, (item) => {
                        using (log.Activity(m => m($"Getting {nameof(AlertHeader)} for {nameof(item.facilityKeys)}:[{string.Join(",", facilityKeys)}], {nameof(item.category)}:{item.category}, {nameof(item.title)}:{item.title}, {nameof(item.start)}:{item.start}, {nameof(item.limit)}:{item.limit}, {nameof(item.ownership)}:{item.ownership}")))
                        {
                            try
                            {
                                var ret = medMinedService.GetAlertHeader(item.facilityKeys, item.category, item.title, item.start, item.limit, item.ownership);
                                log.Info(m => m($"Getting {nameof(AlertHeader)} for {nameof(item.facilityKeys)}:[{string.Join(",", item.facilityKeys)}], {nameof(item.category)}:{item.category}, {nameof(item.title)}:{item.title}, {nameof(item.start)}:{item.start}, {nameof(item.limit)}:{item.limit}, {nameof(item.ownership)}:{item.ownership} success"));
                                alertHeaders.Add(ret);
                            }
                            catch (Exception ex)
                            {
                                log.Error(m => m($"Getting GetAlertHeader for {nameof(item.facilityKeys)}:[{string.Join(",", item.facilityKeys)}], {nameof(item.category)}:{item.category}, {nameof(item.title)}:{item.title}, {nameof(item.start)}:{item.start}, {nameof(item.limit)}:{item.limit}, {nameof(item.ownership)}:{item.ownership} failure"), ex);
                                throw;
                            }
                        }
                    });
                }
                if (!alertHeaders.Any())
                {
                    log.Trace(m => m($"No {nameof(AlertHeader)} found: exit"));
                    return Enumerable.Empty<Alert>().ToList();
                }

                var result = null as List<Alert>;
                using (log.Activity(m => m($"Formatting results")))
                {
                    //flat AlertHeaders
                    result = alertHeaders
                        .Where(alertHeader => alertHeader?.results?.alerts?.Count > 0) 
                        .SelectMany(alertHeader => alertHeader.results.alerts.Select(alert => new Alert
                        {
                            alert_category = alertHeader.results.category,
                            alert_title = alertHeader.results.title,
                            alert_id = alert.alert_id,
                            facility_id = alert.facility_id,
                            status = alert.status,
                            patient_mrn = alert.patient?.mrn,
                            patient_account_number = alert.patient?.account_number,
                            drugs = alert.drugs?.Select(item => new Drug
                            {
                                prescription_number = item.prescription_number,
                                placer_order_number = item.placer_order_number,
                            }).ToArray()
                        }))
                        //#region remove duplicates
                        .GroupBy(item => Tuple.Create(item.alert_id, item.facility_id))
                        .Select(item => item.First())
                        //#endregion remove duplicates
                        .ToList();
                }

                log.Info(m => m($"Getting Alerts from Service with {nameof(facilityKeys)} [{string.Join(",", facilityKeys)}] succeded"));

                return result;
            }
        }

        private Dictionary<Guid, (List<string> PlacerOrderNumbers, List<IdInfo> IdInfos)> GetEnrichmentFromService(List<PageInfo> value)
        {
            using (log.Activity(m => m($"Getting for PlacerOrderNumbers from service")))
            {
                var directMap = options.Value.IdKindMapping.ToDictionary(item => item.Key, item => item.Value);
                var reverseMap = options.Value.IdKindMapping.ToDictionary(item => item.Value, item => item.Key);


                var query = null as MedicalOrderSearchQuery;
                using (log.Activity(m => m($"Preparing query for Order Service")))
                {
                    query = new MedicalOrderSearchQuery
                    {
                        patients = value
                        .Select(pageInfo => new MedicalOrderSearchQuery.Patient
                        {
                            patientIdentifier = GetIdInfos(pageInfo)
                                .Select(item => new MedicalOrderSearchQuery.PatientIdentifier
                                {
                                    value = item.Value,
                                    kind = directMap.ContainsKey(item.IdKind) ? directMap[item.IdKind] : item.IdKind
                                })
                                .ToList(),
                            route = new List<string> { "IV" },
                            timingCode = new List<string> { "Continuous" },
                            notOlderThanDays = 60,
                            //TODO: KB: orderid = (string.IsNullOrWhiteSpace(pageInfo.PlacerOrderNumber)) ? pageInfo.PlacerOrderNumber : null
                            drugInfo = (!string.IsNullOrWhiteSpace(pageInfo.PlacerOrderNumber)) ? null : new MedicalOrderSearchQuery.DrugInfo
                            {
                                name = new MedicalOrderSearchQuery.Name
                                {
                                    terms = new List<string> { pageInfo.PrimaryDrugName }
                                },
                                concentration = new MedicalOrderSearchQuery.Concentration
                                {
                                    amount = double.Parse(pageInfo.Concentration.Amount),
                                    amountUnits = pageInfo.Concentration.AmountUnits,
                                    volume = double.Parse(pageInfo.Concentration.Volume),
                                    volumeUnits = pageInfo.Concentration.VolumeUnits,
                                    criteria = $"{options.Value.Variance}%v"
                                }
                            }
                        })
                        .ToList(),
                        _include = new List<string> { "MedicationOrder:Patient", "MedicationOrder:Medication" }
                    };
                }

                var result = null as MedicalOrderSearchResult;
                using (log.Activity(m => m($"Executing Order Service call")))
                {
                    try
                    {
                        result = orderService.Search(query);
                        //TODO: KB: Shold we trace results?
                        log.Info(m => m($"Searching for MedicalOrder success"));
                    }
                    catch (Exception ex)
                    {
                        log.Error(m => m($"Searching for MedicalOrder failure"), ex);
                        throw;
                    }
                }

                var ret = null as Dictionary<Guid, (List<string> PlacerOrderNumbers, List<IdInfo> IdInfos)>;
                using (log.Activity(m => m($"Processing resullts")))
                {
                    ret = value.Select(pageInfo =>
                    {
                        var expectedIdentifiers = GetIdInfos(pageInfo)
                                .Select(item => new MedicalOrderSearchResult.Identifier
                                {
                                    value = item.Value,
                                    system = directMap.ContainsKey(item.IdKind) ? directMap[item.IdKind] : item.IdKind
                                })
                                .ToList();

                        var ordersNumbers = result.entry
                            .Where(entry => entry.resource.resourceType == "Patient")
                            .Where(entry => entry.resource.identifier.Join(
                                expectedIdentifiers, 
                                e => Tuple.Create(e.system, e.value), 
                                e => Tuple.Create(e.system, e.value),
                                (l,r) => 1).Any())
                            .SelectMany(patient =>
                                result.entry
                                    .Where(entry => entry.resource.resourceType == "MedicationOrder")
                                    .Where(entry => entry.resource.patient.reference == $"Patient/{patient.resource.id}")
                                )
                            .SelectMany(order => order.resource.identifier.Where(identifier => identifier.system == "OrderNumber")
                            .Where(identifier => !string.IsNullOrWhiteSpace(identifier.value)))
                            .Select(identifier => identifier.value);

                        var identifiers = result.entry
                            .Where(entry => entry.resource.resourceType == "Patient")
                            .Where(entry => entry.resource.identifier.Join(
                                expectedIdentifiers,
                                e => Tuple.Create(e.system, e.value),
                                e => Tuple.Create(e.system, e.value),
                                (l, r) => 1).Any())
                            .SelectMany(patient => patient.resource.identifier.Select(item => new 
                            {
                                Value = item.value,
                                IdKind = reverseMap.ContainsKey(item.system) ? reverseMap[item.system] : item.system
                            }))
                            .Distinct()
                            .Select(item => new IdInfo { IdKind = item.IdKind, Value = item.Value });

                        return new {
                            Key = pageInfo.Id,
                            PlacerOrderNumbers = ordersNumbers.ToList(),
                            IdInfos = identifiers.ToList(),
                        };
                    })
                    .ToDictionary(item => item.Key, item => (item.PlacerOrderNumbers,  item.IdInfos));
                }
                return ret;
            }
        }

        private List<IdInfo> GetIdInfos(PageInfo value)
        {
            var result = (value.IdInfo ?? Enumerable.Empty<IdInfo>())
                .Where(item => (!string.IsNullOrWhiteSpace(item.Value)) && (!string.IsNullOrWhiteSpace(item.IdKind)))
                .Union(value.EnrichedIdInfos ?? Enumerable.Empty<IdInfo>())
                .ToList();
            return result;
        }

        private List<string> GetMrns(PageInfo value)
        {
            using (log.Activity(m => m($"Getting Mrns from {nameof(PageInfo)}[{value.Id}]")))
            {
                try
                {
                    var result = GetIdInfos(value)
                        .Where(item => item.IdKind == IdKind.MRN && (!string.IsNullOrWhiteSpace(item.Value)))
                        .Select(item => item.Value)
                        .ToList();
                    log.Trace(m => m($"Mrns for {nameof(PageInfo)}[{value.Id}] is {string.Join(",", result)}"));
                    return result;
                }
                catch (InvalidOperationException ex)
                {
                    log.Trace(m => m($"Cannot Get Mrns for {nameof(PageInfo)}[{value.Id}]"), ex);
                    throw;
                }
            }
        }

        private List<string> GetAccountNumbers(PageInfo value)
        {
            using (log.Activity(m => m($"Getting AccountNumbers from {nameof(PageInfo)}[{value.Id}]")))
            {
                try
                {
                    var result = GetIdInfos(value)
                        .Where(item => item.IdKind == IdKind.AccountNumber && (!string.IsNullOrWhiteSpace(item.Value)))
                        .Select(item => item.Value)
                        .ToList();
                    log.Trace(m => m($"AccountNumbers for {nameof(PageInfo)}[{value.Id}] is {string.Join(",", result)}"));
                    return result;
                }
                catch (InvalidOperationException ex)
                {
                    log.Trace(m => m($"Cannot Get AccountNumbers for {nameof(PageInfo)}[{value.Id}]"), ex);
                    throw;
                }
            }
        }

        private List<string> GetPlaceOrderNumbers(PageInfo value)
        {
            using (log.Activity(m => m($"Getting PlacerOrderNumbers from {nameof(PageInfo)}[{value.Id}]")))
            {
                try
                {
                    var result =
                        (string.IsNullOrEmpty(value.PlacerOrderNumber) ? Enumerable.Empty<string>() : new[] { value.PlacerOrderNumber })
                        .Union(value.EnrichedPlacerOrderNumbers == null ? Enumerable.Empty<string>() : value.EnrichedPlacerOrderNumbers)
                        .ToList();
                    log.Trace(m => m($"PlacerOrderNumbers for {nameof(PageInfo)}[{value.Id}] is {string.Join(",", result)}"));
                    return result;
                }
                catch (InvalidOperationException ex)
                {
                    log.Trace(m => m($"Cannot Get PlacerOrderNumbers for {nameof(PageInfo)}[{value.Id}]"), ex);
                    throw;
                }
            }
        }

        private bool CanProcess(PageInfo value)
        {
            using (log.Activity(m => m($"Checking if {nameof(PageInfo)}[{value.Id}] can be Processed")))
            {
                var idPresented = value.Id != Guid.Empty;
                var idInfoPresented = GetIdInfos(value).Any();
                var medMinedfacilityIdPresented = !string.IsNullOrWhiteSpace(value.MedMinedfacilityId);

                var result = idInfoPresented && medMinedfacilityIdPresented;

                log.Trace(m => m($"Checking { (result ? "positive" : "negative") } Fields for {nameof(PageInfo)}[{value.Id}]"));
                return result;
            }
        }

        private bool CanEnrich(PageInfo value)
        {
            using (log.Activity(m => m($"Checking if {nameof(PageInfo)}[{value.Id}] can be Enriched")))
            {
                var canProcess = CanProcess(value);
                var placerOrderNumberPresented = !string.IsNullOrWhiteSpace(value.PlacerOrderNumber);
                var concentrationPresented = value.Concentration != null;
                var concentrationAmountPresented = concentrationPresented && (!string.IsNullOrWhiteSpace(value.Concentration.Amount));
                var concentrationAmountUnitsPresented = concentrationPresented && (!string.IsNullOrWhiteSpace(value.Concentration.AmountUnits));
                var concentrationVolumePresented = concentrationPresented && (!string.IsNullOrWhiteSpace(value.Concentration.Volume));
                var concentrationVolumeUnitsPresented = concentrationPresented && (!string.IsNullOrWhiteSpace(value.Concentration.VolumeUnits));

                var result = canProcess
                    && (placerOrderNumberPresented || (concentrationPresented && concentrationAmountPresented && concentrationAmountUnitsPresented && concentrationVolumePresented && concentrationVolumeUnitsPresented));

                log.Trace(m => m($"Checking { (result ? "positive" : "negative") } Fields for {nameof(PageInfo)}[{value.Id}]"));
                return result;
            }
        }

        private bool CanMatch(PageInfo value)
        {
            using (log.Activity(m => m($"Checking if {nameof(PageInfo)}[{value.Id}] can be Matched")))
            {
                var mrnPresented = GetMrns(value) != null;
                var accountNumberPresented = GetAccountNumbers(value) != null;
                var placerOrderNumberPresented = (!string.IsNullOrWhiteSpace(value.PlacerOrderNumber)) || (value.EnrichedPlacerOrderNumbers != null && value.EnrichedPlacerOrderNumbers.Any());

                var result = (mrnPresented || accountNumberPresented) && placerOrderNumberPresented;

                log.Trace(m => m($"Checking { (result ? "positive" : "negative") } Fields for {nameof(PageInfo)}[{value.Id}]"));
                return result;
            }
        }

        private bool Match(PageInfo pageInfo, Alert alert)
        {
            using (log.Activity(m => m($"Matching {nameof(PageInfo)}[{pageInfo.Id}] with {nameof(Alert)}[{alert.alert_id}]")))
            {
                var mrns = GetMrns(pageInfo);
                var accountNumbers = GetAccountNumbers(pageInfo);
                var placeOrderNumbers = GetPlaceOrderNumbers(pageInfo);

                #region Required 
                var mrnMatches = mrns.Contains(alert.patient_mrn);
                var accountNumberMatches = accountNumbers.Contains(alert.patient_account_number);
                var medMinedfacilityIdMatches = pageInfo.MedMinedfacilityId == alert.facility_id.ToString();
                
                log.Trace(m => m("Match PageInfo: {0}", JsonConvert.SerializeObject(pageInfo)));
                log.Trace(m => m("Match Alert: {0}", JsonConvert.SerializeObject(alert)));

                var alertOrderNumbers = alert.drugs.Where(item => !string.IsNullOrWhiteSpace(item.placer_order_number)).Select(item => item.placer_order_number)
                    .Union(alert.drugs.Where(item => !string.IsNullOrWhiteSpace(item.prescription_number)).Select(item => item.prescription_number));

                var placeOrderNumbersMatches = placeOrderNumbers.Intersect(alertOrderNumbers).Any();

                log.Trace(m=> m($"mrnMatches: {mrnMatches} || accountNumberMatches: {accountNumberMatches} && medMinedfacilityIdMatches: {medMinedfacilityIdMatches} " +
                                $"&& placeOrderNumbersMatches: {placeOrderNumbersMatches}"));

                var requiredMatches = (mrnMatches || accountNumberMatches) && medMinedfacilityIdMatches && placeOrderNumbersMatches;

                #endregion Required 

                #region Optional
                var optionalMatches = true;
                //TODO: Add optional logic here
                #endregion Optional

                var matches = requiredMatches && optionalMatches;

                log.Trace(m => m($"Match {(matches ? "positive" : "negative")} for {nameof(PageInfo)}[{pageInfo.Id}] with {nameof(Alert)}[{alert.alert_id}]"));

                return matches;
            }
        }

        private void Fill(PageInfo pageInfo, Alert alert)
        {
            using (log.Activity(m => m($"Filling {nameof(PageInfo)}[{pageInfo.Id}] with {nameof(Alert)}[{alert.alert_id}]")))
            {
                if (pageInfo.MedMinedAlert == null)
                {
                    pageInfo.MedMinedAlert = new List<MedMinedAlert>();
                }
                pageInfo.MedMinedAlert.Add(new MedMinedAlert
                {
                    AlertId = alert.alert_id.ToString(),
                    AlertCategory = alert.alert_category,
                    AlertTitle = alert.alert_title,
                    MedMinedfacilityId = alert.facility_id.ToString(),
                    Status = alert.status
                });
            }
        }
    }
}