using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class UserSetting
    {
        public UserSetting()
        {
            Facilities = new List<Facility>();
            GeneralSettings = new List<GeneralSetting>();
            ColumnOptions = new List<ColumnOption>();
        }

        public ICollection<Facility> Facilities { get; set; }

        public ICollection<GeneralSetting> GeneralSettings { get; set; }

        public Filters Filters { get; set; }

        public ICollection<ColumnOption> ColumnOptions { get; set; }

    }
}

