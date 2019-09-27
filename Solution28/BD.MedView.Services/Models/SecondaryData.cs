using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace BD.MedView.Services.Models
{
    public class SecondaryData
    {
        [Required]
        public PageInfoList PageInfoList { get; set; }
    }

    public class PageInfoList
    {
        [Required]
        public List<PageInfo> PageInfo { get; set; }
    }

    public class PageInfo
    {
        #region Correlation
        public Guid Id { get; set; }
        #endregion Correlation

        #region Input
        public string MedMinedfacilityId { get; set; }
        public List<IdInfo> IdInfo { get; set; }
        public string PatientFirstName { get; set; }
        public string PatientLastName { get; set; }
        public string PlacerOrderNumber { get; set; }
        public string PrimaryDrugId { get; set; }
        public string PrimaryDrugName { get; set; }
        public DateTime MedicationStartDateTime { get; set; }
        public Concentration Concentration { get; set; }
        #endregion Input

        #region Transient
        public List<string> EnrichedPlacerOrderNumbers { get; set; }
        public List<IdInfo> EnrichedIdInfos { get; set; }
        #endregion Transient

        #region Output
        public List<MedMinedAlert> MedMinedAlert { get; set; }
        #endregion Output
    }

    //Manual Validation - invalid objects can be ignored
    public class IdInfo
    {
        [Required]
        public string IdKind { get; set; }
        public string Value { get; set; }
    }

    //Manual Validation - invalid objects can be ignored
    public class Concentration
    {
        //[Required]
        public string Amount { get; set; }
        //[Required]
        public string AmountUnits { get; set; }
        public string Volume { get; set; }
        public string VolumeUnits { get; set; }
    }

    public class MedMinedAlert
    {
        public string AlertId { get; set; }
        public string AlertCategory { get; set; }
        public string AlertTitle { get; set; }
        public string MedMinedfacilityId { get; set; }
        public string Status { get; set; }
    }
}