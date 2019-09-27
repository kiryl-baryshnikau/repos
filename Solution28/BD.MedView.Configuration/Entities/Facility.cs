using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    [System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
    public class Facility
    {
        public Facility()
        {
            Units = new List<string>();
            Widgets = new List<Widget>();
        }

        public string Id { get; set; }
        public bool Selected { get; set; }

        public ICollection<Widget> Widgets { get; set; }
        public ICollection<string> Units { get; set; }
    }
}
