using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BD.MedView.Configuration
{
    public class InfusionPreference : GlobalPreferences
    {
        //public int ContainerTolerance { get; set; }
        //public ICollection<InfusionSetting> ExcludedInfusions { get; set; }
        //public int PreserveRecords { get; set; }
        //public int PriorityThreshold { get; set; }
        //public int WarningThreshold { get; set; }
        //public int UrgentThreshold { get; set; }
        //public int RefreshRate { get; set; }
        //public int? OrderServiceVariance { get; set; }

        [Required]
        public string RequiredField { get; set; }
    }

    public class InfusionSetting 
    {
        public string Name { get; set; }

        public bool AddedByUser { get; set; }
    }
}
