using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    public class InfusionGlobalPreference : GlobalPreference
    {
        public InfusionGlobalPreference()
        {
            ExcludedInfusions = new List<InfusionGlobalSetting>();
        }

        [ObjectMapped]
        public int ContainerTolerance { get; set; }
        [ObjectMapped]
        public List<InfusionGlobalSetting> ExcludedInfusions { get; set; }
        [ObjectMapped]
        public int PreserveRecords { get; set; }
        [ObjectMapped]
        public int PriorityThreshold { get; set; }
        [ObjectMapped]
        public int WarningThreshold { get; set; }
        [ObjectMapped]
        public int UrgentThreshold { get; set; }
        [ObjectMapped]
        public int RefreshRate { get; set; }
        [ObjectMapped]
        public int? OrderServiceVariance { get; set; }
    }
}
