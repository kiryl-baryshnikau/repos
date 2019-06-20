using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{

    public class InfusionSetting
    {
        public string Name { get; set; }

        public bool AddedByUser { get; set; }
    }

    public class InfusionPreference: GlobalPreference
    {
        [ObjectMappedAttribute]
        public int ContainerTolerance { get; set; }
        [ObjectMappedAttribute]
        public ICollection<InfusionSetting> ExcludedInfusions { get; set; }
        [ObjectMappedAttribute]
        public int PreserveRecords { get; set; }
        [ObjectMappedAttribute]
        public int PriorityThreshold { get; set; }
        [ObjectMappedAttribute]
        public int WarningThreshold { get; set; }
        [ObjectMappedAttribute]
        public int UrgentThreshold { get; set; }
        [ObjectMappedAttribute]
        public int RefreshRate { get; set; }
        [ObjectMappedAttribute]
        public int? OrderServiceVariance { get; set; }
        [ObjectMappedAttribute]
        [Required]
        public string RequiredStringProperty { get; set; }

    }
}