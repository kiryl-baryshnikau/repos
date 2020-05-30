namespace ConsoleApp2
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("IVPL.vw_ContainerAndGrwarnings")]
    public partial class ContainerAndGuardrailWarnings
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int InfusionContainerKey { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(20)]
        public string PcuId { get; set; }

        [Key]
        [Column(Order = 2)]
        [StringLength(20)]
        public string ModuleId { get; set; }

        [Key]
        [Column(Order = 3)]
        [StringLength(20)]
        public string ModuleType { get; set; }

        [StringLength(20)]
        public string PatientId { get; set; }

        [StringLength(255)]
        public string AdtPatientId { get; set; }

        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string MiddleName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [StringLength(204)]
        public string PatientName { get; set; }

        [StringLength(100)]
        public string AdtFacility { get; set; }

        [StringLength(100)]
        public string PatientCareUnit { get; set; }

        [StringLength(100)]
        public string Room { get; set; }

        [Key]
        [Column(Order = 4)]
        [StringLength(255)]
        public string Infusion { get; set; }

        [StringLength(20)]
        public string PlacerOrderId { get; set; }

        [Key]
        [Column(Order = 5)]
        public double DrugAmount { get; set; }

        [Key]
        [Column(Order = 6)]
        [StringLength(20)]
        public string DrugUnit { get; set; }

        [Key]
        [Column(Order = 7)]
        public double DiluentAmount { get; set; }

        [Key]
        [Column(Order = 8)]
        [StringLength(20)]
        public string DiluentUnit { get; set; }

        [Key]
        [Column(Order = 9)]
        [StringLength(20)]
        public string InfusionType { get; set; }

        [Key]
        [Column(Order = 10)]
        public double TotalContainerInfusedVolume { get; set; }

        [Key]
        [Column(Order = 11, TypeName = "datetime2")]
        public DateTime ContainerStartDateTime { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? StopDateTime { get; set; }

        [Key]
        [Column(Order = 12, TypeName = "datetime2")]
        public DateTime ContainerEstimatedEmptyTime { get; set; }

        [Key]
        [Column(Order = 13, TypeName = "datetime2")]
        public DateTime LastKnownContainerEstimatedEmptyTime { get; set; }

        [Key]
        [Column(Order = 14)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ContainerStatus { get; set; }

        [Key]
        [Column(Order = 15)]
        public bool HasGuardrailsWarning { get; set; }

        [Key]
        [Column(Order = 16)]
        public double Vtbi { get; set; }

        [StringLength(100)]
        public string Profile { get; set; }

        [StringLength(100)]
        public string FacilityId { get; set; }

        [StringLength(100)]
        public string FacilityTimezoneId { get; set; }

        [Key]
        [Column(Order = 17)]
        public bool IsKvo { get; set; }

        [Key]
        [Column(Order = 18)]
        public double RemainingVolume { get; set; }

        [StringLength(50)]
        public string ClinicianId { get; set; }

        public double? BolusRateAmount { get; set; }

        [StringLength(20)]
        public string BolusRateTimeUnit { get; set; }

        [StringLength(20)]
        public string BolusType { get; set; }

        [Key]
        [Column(Order = 19)]
        public double RateAmount { get; set; }

        [Key]
        [Column(Order = 20)]
        [StringLength(20)]
        public string RateTimeUnit { get; set; }

        [Key]
        [Column(Order = 21)]
        public double DoseRateAmount { get; set; }

        [Key]
        [Column(Order = 22)]
        [StringLength(20)]
        public string DoseRateUnit { get; set; }

        [Key]
        [Column(Order = 23)]
        [StringLength(20)]
        public string DoseRateModifierUnit { get; set; }

        [Key]
        [Column(Order = 24)]
        [StringLength(20)]
        public string DoseRateTimeUnit { get; set; }

        [Key]
        [Column(Order = 25)]
        [StringLength(20)]
        public string GRConcentrationLimit { get; set; }

        [Key]
        [Column(Order = 26)]
        [StringLength(20)]
        public string GRBdarLimitsStatus { get; set; }

        [Key]
        [Column(Order = 27)]
        [StringLength(20)]
        public string GRBolusDoseLimitsStatus { get; set; }

        [Key]
        [Column(Order = 28)]
        [StringLength(20)]
        public string GRDoseLimitsStatus { get; set; }

        [Key]
        [Column(Order = 29)]
        [StringLength(20)]
        public string GRDurationLimitsStatus { get; set; }

        [Key]
        [Column(Order = 30)]
        [StringLength(20)]
        public string GRRateLimitsStatus { get; set; }

        [Key]
        [Column(Order = 31, TypeName = "datetime2")]
        public DateTime LastUpdateDateTime { get; set; }

        [Key]
        [Column(Order = 32, TypeName = "datetime2")]
        public DateTime EventDateTime { get; set; }

        public int? AcknowledgedState { get; set; }

        [StringLength(50)]
        public string AcknowledgedByUser { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? AcknowledgementDateTime { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? DOB { get; set; }

        [StringLength(255)]
        public string AccountNumber { get; set; }

        [StringLength(60)]
        public string Gender { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? AdmitDate { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? DischargeDate { get; set; }

        [StringLength(100)]
        public string Floor { get; set; }

        [StringLength(100)]
        public string Bed { get; set; }

        [StringLength(100)]
        public string Physician { get; set; }
    }
}
