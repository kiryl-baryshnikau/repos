using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class UnitFilter
    {
        public UnitFilter()
        {
            Patients = new List<PatientFilter>();
        }

        public string UnitId { get; set; }
        public ICollection<PatientFilter> Patients { get; set; }
    }
}
