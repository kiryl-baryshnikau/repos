using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            var requestContent = "{\"preservehours\":72,\"startDate\":\"2020-03-26T12:33:06.124Z\",\"stopDate\":\"2020-03-26T20:33:06.124Z\",\"facilities\":\"00000000000000000000000000000000;910001;910000;900300;910004\",\"units\":\"\"}";
            if (args.Length > 0) {
                requestContent = args[0];
            }
            var dataFilters = JsonConvert.DeserializeObject<DataFilters>(requestContent);

            var stopwatch = new Stopwatch();
            stopwatch.Start();
            var m = new Model1();
            var dbQueryContainerAndGuardRailWarnings = m.vw_ContainerAndGrwarnings.AsNoTracking() as IQueryable<ConsoleApp1.ContainerAndGrwarnings>;
            dbQueryContainerAndGuardRailWarnings = ExecuteFilters(dataFilters, dbQueryContainerAndGuardRailWarnings);
            var obj = dbQueryContainerAndGuardRailWarnings.ToList();
            stopwatch.Stop();
            Console.WriteLine(stopwatch.Elapsed);
            stopwatch = new Stopwatch();
            stopwatch.Start();
            var responseContent = JsonConvert.SerializeObject(obj, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
            stopwatch.Stop();
            Console.WriteLine(stopwatch.Elapsed);
            Console.ReadLine();
            Console.WriteLine(responseContent);
            Console.ReadLine();
        }

        private static IQueryable<ContainerAndGrwarnings> ExecuteFilters(DataFilters dataFilters, IQueryable<ContainerAndGrwarnings> dbQueryContainerAndGuardRailWarnings)
        {
            //Filters data by Facilities.
            if (!string.IsNullOrEmpty(dataFilters.Facilities))
                dbQueryContainerAndGuardRailWarnings = FilterByFacilities(dataFilters, dbQueryContainerAndGuardRailWarnings);

            //Filters data by Units
            if (!string.IsNullOrEmpty(dataFilters.Units))
            {
                dbQueryContainerAndGuardRailWarnings = FilterByUnits(dataFilters.Units, dbQueryContainerAndGuardRailWarnings);
            }

            //Filters data by Patients
            if (!string.IsNullOrEmpty(dataFilters.Patients))
                dbQueryContainerAndGuardRailWarnings = FilterByPatients(dataFilters.Patients, dbQueryContainerAndGuardRailWarnings);

            //Filters data by InfusionTypes
            if (!string.IsNullOrEmpty(dataFilters.Infusions))
                dbQueryContainerAndGuardRailWarnings = FilterByInfusionTypes(dataFilters.Infusions, dbQueryContainerAndGuardRailWarnings);

            //Filters data by Infusion Statues
            if (!string.IsNullOrEmpty(dataFilters.Statuses))
                dbQueryContainerAndGuardRailWarnings = FilterByInfusionStatuses(dataFilters.Statuses, dbQueryContainerAndGuardRailWarnings);

            //Filters data in specified datetime range.
            dbQueryContainerAndGuardRailWarnings = FilterByDateTime(dataFilters.Startdate, dataFilters.Stopdate, dataFilters.Preservehours, dbQueryContainerAndGuardRailWarnings);

            return dbQueryContainerAndGuardRailWarnings;
        }

        public enum InfusionStatusEnum
        {
            Completed = 1200,
            Disconnected = 1201,
            Infusing = 1202,
            Stopped = 1203,
            End = 1204,
            Created = 1205
        }

        public static IQueryable<ContainerAndGrwarnings> FilterByFacilities(DataFilters filters, IQueryable<ContainerAndGrwarnings> containerAndGuardRailWarnings)
        {
            try
            {
                var facilites = filters.Facilities;
                var facilityList = Generic.StringToList(facilites);
                //var filterByFacilitiesResponse = filters.AllowUnknown ?
                //    containerAndGuardRailWarnings.Where(p => facilityList.Contains(p.AdtFacility.ToLower()) || p.AdtFacility == null) :
                //    containerAndGuardRailWarnings.Where(p => facilityList.Contains(p.AdtFacility.ToLower()));
                var filterByFacilitiesResponse = filters.AllowUnknown ?
                    containerAndGuardRailWarnings.Where(p => facilityList.Contains(p.AdtFacility) || p.AdtFacility == null) :
                    containerAndGuardRailWarnings.Where(p => facilityList.Contains(p.AdtFacility));
                return filterByFacilitiesResponse;
            }
            catch (Exception ex)
            {
                //log.Error("Facilities Filter Method Has Failed : " + ex);
                return containerAndGuardRailWarnings;
            }
        }

        public static IQueryable<ContainerAndGrwarnings> FilterByUnits(string units, IQueryable<ContainerAndGrwarnings> filterByFacilitiesResponse)
        {
            try
            {
                var unitList = Generic.StringToList(units);
                var filterByUnits = filterByFacilitiesResponse.Where(p => unitList.Contains(p.PatientCareUnit.ToLower()));
                return filterByUnits;
            }
            catch (Exception ex)
            {
                //log.Error("Units Filter Method Has Failed : " + ex);
                return filterByFacilitiesResponse;
            }
        }

        public static IQueryable<ContainerAndGrwarnings> FilterByPatients(string patients, IQueryable<ContainerAndGrwarnings> filterByUnitsResponse)
        {
            try
            {
                var patientList = Generic.StringToList(patients);
                var filterByPatients = filterByUnitsResponse.Where(p => patientList.Contains(p.PatientId.ToLower()));
                return filterByPatients;
            }
            catch (Exception ex)
            {
                //log.Error("Patients Filter Method Has Failed : " + ex);
                return filterByUnitsResponse;
            }
        }

        public static IQueryable<ContainerAndGrwarnings> FilterByInfusionTypes(string infusionTypes, IQueryable<ContainerAndGrwarnings> filterByPatientsResponse)
        {
            try
            {
                var infusionTypeList = Generic.StringToList(infusionTypes);
                var filterByInfusionTypes = filterByPatientsResponse.Where(p => infusionTypeList.Contains(p.InfusionType.ToLower()));
                return filterByInfusionTypes;
            }
            catch (Exception ex)
            {
                //log.Error("Infusion Types Filter Method Has Failed : " + ex);
                return filterByPatientsResponse;
            }
        }

        public static IQueryable<ContainerAndGrwarnings> FilterByInfusionStatuses(string infusionStatuses, IQueryable<ContainerAndGrwarnings> filterByInfusionTypesResponse)
        {
            try
            {
                var infusionStatusList = Generic.StringToList(infusionStatuses);
                var filterByInfusionStatuses = filterByInfusionTypesResponse.Where(p => infusionStatusList.Contains(p.ContainerStatus.ToString()));
                return filterByInfusionStatuses;
            }
            catch (Exception ex)
            {
                //log.Error("Infusion Status Filter Method Has Failed : " + ex);
                return filterByInfusionTypesResponse;
            }
        }

        public static IQueryable<ContainerAndGrwarnings> FilterByDateTime(DateTime? startDateTime, DateTime? stopDateTime, short dataRetentionHours, IQueryable<ContainerAndGrwarnings> filterByPatientsResponse)
        {
            try
            {
                var dataRetention = DateTime.UtcNow - TimeSpan.FromHours(dataRetentionHours);
                IQueryable<ContainerAndGrwarnings> filterByDateTime;
                bool isValidDateRange = startDateTime != null && stopDateTime != null &&
                                        startDateTime != DateTime.MinValue && stopDateTime != DateTime.MinValue;

                if (isValidDateRange)
                {
                    filterByDateTime = filterByPatientsResponse
                        .Where(p =>
                            (p.EventDateTime > dataRetention && p.ContainerStartDateTime <= stopDateTime &&
                            (p.EventDateTime >= startDateTime || (p.ContainerStatus == (int)InfusionStatusEnum.Infusing || p.ContainerStatus == (int)InfusionStatusEnum.Stopped))));
                }
                else
                {
                    filterByDateTime = filterByPatientsResponse.Where(p => (p.EventDateTime > dataRetention));
                }

                return filterByDateTime;
            }
            catch (Exception ex)
            {
                //log.Error("DateTime Filter Method Has Failed : " + ex);
                return filterByPatientsResponse;
            }
        }

        public class DataFilters
        {
            public string Facilities { get; set; }
            public string Units { get; set; }
            public string Patients { get; set; }
            public string Infusions { get; set; }
            public string Statuses { get; set; }
            public DateTime? Startdate { get; set; }
            public DateTime? Stopdate { get; set; }
            public short Preservehours { get; set; }
            public bool AllowUnknown { get; set; }
        }
        
        public static class Generic
        {
            private static readonly string stringSeperator = ";";// Constants.StringSeperator;
            public static List<string> StringToList(string values)
            {
                var stringList = new List<String>();
                if (!string.IsNullOrWhiteSpace(values))
                {
                    stringList = values.ToLower().Split(Convert.ToChar(stringSeperator)).ToList();
                }
                return stringList;
            }
        }
    }

}
