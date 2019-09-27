using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    public class FacilityFilter
    {
        [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
        public FacilityFilter()
        {
            Units = new List<UnitFilter>();
        }

        public string FacilityId { get; set; }
        public ICollection<UnitFilter> Units { get; set; }
    }
}
