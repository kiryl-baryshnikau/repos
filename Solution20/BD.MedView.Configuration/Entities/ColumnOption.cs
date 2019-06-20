using System.Collections.Generic;

namespace BD.MedView.Configuration
{
    public class ColumnOption
    {
        public string Widget { get; set; }

        public ICollection<ColumnOptionValue> Values { get; set; }

    }
}